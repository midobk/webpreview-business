import { NextResponse } from 'next/server';
import { getLeads } from '@/lib/data-source';
import { getSupabase } from '@/lib/supabase';

const requestTimestamps = new Map<string, number[]>();
type LeadLookup = { id: string; slug?: string; email?: string | null; notes?: string | null };

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Variant previews are served from `data/prototypes/<lead-slug>-vN/index.html`,
// so the URL slug ends in `-v<digits>`. The lead record itself only stores
// the base slug, so strip the variant suffix before looking it up.
const VARIANT_SLUG_PATTERN = /^(.+)-v\d+$/;

function resolveVariantBase(slug: string): string {
  const match = VARIANT_SLUG_PATTERN.exec(slug);
  return match ? match[1] : slug;
}

function slugMatchesLead(slug: string, leadSlug: string | null | undefined): boolean {
  if (!leadSlug) return false;
  return leadSlug === slug || leadSlug.startsWith(`${slug}-`);
}

function findLeadForSlug<T extends LeadLookup>(leads: T[], incomingSlug: string): T | null {
  const candidates = [incomingSlug, resolveVariantBase(incomingSlug)];
  for (const candidate of candidates) {
    const exact = leads.find((lead) => lead.slug === candidate);
    if (exact) return exact;
  }
  for (const candidate of candidates) {
    const prefix = leads.find((lead) => slugMatchesLead(candidate, lead.slug));
    if (prefix) return prefix;
  }
  return null;
}

function limited(ip: string) {
  const now = Date.now();
  const recent = (requestTimestamps.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return true;
  recent.push(now);
  requestTimestamps.set(ip, recent);
  return false;
}

function appendNote(existing: string | null | undefined, request: string) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] Customer requested changes: ${request}`;
  return existing ? `${existing.trim()}\n\n${entry}` : entry;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const changeRequest = typeof body.request === 'string' ? body.request.trim() : '';

    if (!slug || slug.length > 160 || !isEmail(email) || email.length > 254) {
      return NextResponse.json({ error: 'Enter the email used for the draft.' }, { status: 400 });
    }
    if (!changeRequest || changeRequest.length < 10 || changeRequest.length > 4000) {
      return NextResponse.json({ error: 'Tell us what you would like changed (10–4000 characters).' }, { status: 400 });
    }

    const supabase = getSupabase();
    let lead: LeadLookup | null = null;

    if (supabase) {
      // Lead slugs are stored as `<business-slug>-<uuid8>` in Supabase.
      // Variant previews post the directory slug (`<business-slug>-vN`),
      // so resolve the base before querying.
      const baseSlug = resolveVariantBase(slug);
      const result = await supabase
        .from('leads')
        .select('id,slug,email,notes')
        .like('slug', `${baseSlug}%`)
        .maybeSingle();
      if (result.error) throw result.error;
      lead = result.data;
    } else {
      const leads = (await getLeads()) as LeadLookup[];
      lead = findLeadForSlug(leads, slug);
    }

    if (!lead || !lead.email || lead.email.trim().toLowerCase() !== email) {
      return NextResponse.json({ error: 'That email does not match the draft recipient.' }, { status: 403 });
    }

    const note = appendNote(lead.notes, changeRequest);
    const revisionId = `revision-${crypto.randomUUID()}`;

    if (supabase) {
      const revision = await supabase.from('revision_requests').insert({
        id: revisionId,
        lead_id: lead.id,
        request: changeRequest,
        status: 'new',
      });
      if (revision.error) throw revision.error;

      const update = await supabase
        .from('leads')
        .update({ status: 'revision_requested', notes: note, updated_at: new Date().toISOString() })
        .eq('id', lead.id);
      if (update.error) throw update.error;
    } else {
      const fs = await import('fs/promises');
      const path = await import('path');
      const leadsPath = path.join(process.cwd(), 'data', 'leads.json');
      const leads = JSON.parse(await fs.readFile(leadsPath, 'utf8')) as Array<Record<string, unknown>>;
      const index = leads.findIndex((candidate) => candidate.id === lead?.id);
      if (index === -1) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
      leads[index].status = 'revision_requested';
      leads[index].notes = note;
      leads[index].updated_at = new Date().toISOString();
      await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2));
    }

    return NextResponse.json({ success: true, status: 'revision_requested' }, { status: 201 });
  } catch (error) {
    console.error('Revision request failed:', error);
    return NextResponse.json({ error: 'We could not save that request. Please try again.' }, { status: 500 });
  }
}
