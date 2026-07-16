import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getLeads } from '@/lib/data-source';
import { getSupabase } from '@/lib/supabase';
import { rateLimited, requestIp } from '@/lib/request-guard';
import { isValidDraftPreviewToken } from '@/lib/draft-preview-token';
import { requireAdmin } from '@/lib/auth-server';

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
  // Lead slugs are stored as <business-slug>-<uuid8>. A bare startsWith would
  // match a different business that merely shares a prefix (e.g. base "acme"
  // matching both "acme-aaa1aaaa" and "acme-bbb2bbbb"), so the revision note
  // could be written to the wrong lead. Require an exact match or the
  // documented <base>-<8 hex> suffix only.
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}(-[a-f0-9]{8})?$`, 'i').test(leadSlug);
}

function findLeadForSlug<T extends LeadLookup>(leads: T[], incomingSlug: string, email: string): T | null {
  const candidates = [incomingSlug, resolveVariantBase(incomingSlug)];
  for (const candidate of candidates) {
    const exact = leads.find((lead) => lead.slug === candidate && lead.email?.trim().toLowerCase() === email);
    if (exact) return exact;
  }
  for (const candidate of candidates) {
    const prefix = leads.find((lead) => slugMatchesLead(candidate, lead.slug) && lead.email?.trim().toLowerCase() === email);
    if (prefix) return prefix;
  }
  return null;
}

function appendNote(existing: string | null | undefined, request: string, marker: string) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] Customer requested changes: ${request} ${marker}`;
  return existing ? `${existing.trim()}\n\n${entry}` : entry;
}

function revisionKey(leadId: string, email: string, changeRequest: string): string {
  return createHash('sha256')
    .update(`${leadId}\0${email}\0${changeRequest}`)
    .digest('hex');
}

export async function POST(request: Request) {
  if (rateLimited(`revision:${requestIp(request)}`, 5)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 12_000) {
      return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    }
    const body = await request.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const changeRequest = typeof body.request === 'string' ? body.request.trim() : '';

    if (!slug || slug.length > 160 || /[%_\\]/.test(slug) || !isEmail(email) || email.length > 254) {
      return NextResponse.json({ error: 'Enter the email used for the draft.' }, { status: 400 });
    }
    if (!changeRequest || changeRequest.length < 10 || changeRequest.length > 4000) {
      return NextResponse.json({ error: 'Tell us what you would like changed (10–4000 characters).' }, { status: 400 });
    }

    // This state-changing route must prove possession of the private draft
    // link, not just knowledge of slug + email: lead emails are public
    // outreach targets and slugs are derivable from the business name, so
    // email alone would let anyone append revision notes to a lead. Accept
    // the signed preview token the /preview page passes through, or an
    // authenticated admin session (dashboard previews carry no token).
    const token = typeof body.token === 'string' ? body.token : undefined;
    if (!isValidDraftPreviewToken(slug, token) && requireAdmin(request) !== null) {
      return NextResponse.json(
        { error: 'This preview link is no longer valid. Please use the link from your email.' },
        { status: 403 }
      );
    }

    const supabase = getSupabase();
    let lead: LeadLookup | null = null;

    if (supabase) {
      // Lead slugs are stored as `<business-slug>-<uuid8>` in Supabase.
      // Variant previews post the directory slug (`<business-slug>-vN`),
      // so resolve the base before querying. Try exact matches first
      // (handles both the variant URL and the base slug if it was stored
      // without a uuid suffix); only fall back to a prefix scan if needed,
      // and never use `maybeSingle()` on a prefix query — duplicate draft
      // requests can produce multiple leads sharing the same base slug,
      // which would 500 the route before the email check ever runs.
      const baseSlug = resolveVariantBase(slug);
      const candidates = Array.from(new Set([slug, baseSlug]));

      const exactResult = await supabase
        .from('leads')
        .select('id,slug,email,notes')
        .in('slug', candidates);
      if (exactResult.error) throw exactResult.error;
      lead = (exactResult.data || []).find((row) => row.email?.trim().toLowerCase() === email) ?? null;

      if (!lead) {
        const prefixResult = await supabase
          .from('leads')
          .select('id,slug,email,notes')
          .like('slug', `${baseSlug}%`);
        if (prefixResult.error) throw prefixResult.error;
        lead =
          (prefixResult.data || []).find((row) => slugMatchesLead(baseSlug, row.slug) && row.email?.trim().toLowerCase() === email) ?? null;
      }
    } else {
      const leads = (await getLeads()) as LeadLookup[];
      lead = findLeadForSlug(leads, slug, email);
    }

    if (!lead || !lead.email || lead.email.trim().toLowerCase() !== email) {
      return NextResponse.json({ error: 'That email does not match the draft recipient.' }, { status: 403 });
    }

    const key = revisionKey(lead.id, email, changeRequest);
    const marker = `[revision:${key}]`;
    const revisionId = `revision-${key.slice(0, 32)}`;

    if (supabase) {
      const revision = await supabase.from('revision_requests').upsert({
        id: revisionId,
        lead_id: lead.id,
        request: changeRequest,
        status: 'new',
      }, { onConflict: 'id', ignoreDuplicates: true });
      if (revision.error) throw revision.error;

      // Append the note atomically via RPC. The previous read-modify-write
      // (read notes, append in JS, write the whole string back) raced: two
      // concurrent revision requests from the same lead clobbered each other
      // and the losing entry was dropped. The RPC appends inside a single
      // UPDATE (serialized by the row lock) and is idempotent on the marker,
      // so a retry does not double-append.
      const entry = `[${new Date().toISOString()}] Customer requested changes: ${changeRequest} ${marker}`;
      const { error: noteError } = await supabase.rpc('append_lead_note', {
        p_lead_id: lead.id,
        p_marker: marker,
        p_entry: entry,
      });
      if (noteError) throw noteError;
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Revision requests require Supabase in production.' }, { status: 503 });
    } else {
      const fs = await import('fs/promises');
      const path = await import('path');
      const leadsPath = path.join(process.cwd(), 'data', 'leads.json');
      const leads = JSON.parse(await fs.readFile(leadsPath, 'utf8')) as Array<Record<string, unknown>>;
      const index = leads.findIndex((candidate) => candidate.id === lead?.id);
      if (index === -1) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
      leads[index].status = 'revision_requested';
      leads[index].notes = appendNote(
        (leads[index].notes as string | null | undefined) ?? lead?.notes,
        changeRequest,
        marker,
      );
      leads[index].updated_at = new Date().toISOString();
      await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2));
    }

    return NextResponse.json({ success: true, status: 'revision_requested' }, { status: 201 });
  } catch (error) {
    console.error('Revision request failed:', error);
    return NextResponse.json({ error: 'We could not save that request. Please try again.' }, { status: 500 });
  }
}
