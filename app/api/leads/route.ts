import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/.+\..+/i;
const LIMITS = {
  businessName: 120,
  email: 254,
  website: 2_048,
  message: 1_000,
};
const MAX_BODY_BYTES = 20_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const requestLog = new Map<string, { count: number; resetAt: number }>();

function readString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || 'website-draft';
}

/** POST /api/leads — public draft-request intake. */
export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const nowMs = Date.now();
    const current = requestLog.get(ip);
    if (!current || current.resetAt <= nowMs) {
      requestLog.set(ip, { count: 1, resetAt: nowMs + RATE_LIMIT_WINDOW_MS });
    } else if (current.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    } else {
      current.count += 1;
    }

    const body = await request.json().catch(() => null);
    // Quiet honeypot: automated submissions receive a neutral response but
    // never reach persistence or the production queue. We check two names:
    //   - honey_field_v2 is the current off-screen input on the form
    //   - company is the legacy name; kept so an older cached form, a
    //     direct API caller, or a script replaying the old payload is still
    //     treated as a bot. The real form only ever sends honey_field_v2.
    if (
      readString(body?.honey_field_v2, 120) ||
      readString(body?.company, 120)
    ) {
      return NextResponse.json({ message: 'Draft request received.' }, { status: 201 });
    }
    const businessName = readString(body?.businessName, LIMITS.businessName);
    const email = readString(body?.email, LIMITS.email);
    const website = readString(body?.website, LIMITS.website);
    const message = readString(body?.message, LIMITS.message);

    if (!businessName || !email) {
      return NextResponse.json(
        { error: 'Business name and email are required.' },
        { status: 400 }
      );
    }
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (website && !URL_PATTERN.test(website)) {
      return NextResponse.json(
        { error: 'Website URLs must start with http:// or https://.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    const lead = {
      id,
      business_name: businessName,
      slug: `${slugify(businessName)}-${id.slice(0, 8)}`,
      country: 'Canada',
      email,
      website_url: website || null,
      description: message || null,
      services: [],
      source_urls: [],
      status: 'new',
      created_at: now,
      updated_at: now,
    };

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('leads').insert(lead);
      if (error) {
        console.error('Supabase lead insert failed:', error.message);
        return NextResponse.json(
          { error: 'We could not save your request. Please try again in a moment.' },
          { status: 500 }
        );
      }
      return NextResponse.json({ message: 'Draft request received.' }, { status: 201 });
    }

    // Local development fallback only. Production needs a durable database.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Draft requests are temporarily unavailable. Please email hello@seawaysites.com.' },
        { status: 503 }
      );
    }

    const leadsPath = path.join(process.cwd(), 'data', 'leads.json');
    const existing = JSON.parse(await fs.readFile(leadsPath, 'utf8'));
    existing.push(lead);
    await fs.writeFile(leadsPath, JSON.stringify(existing, null, 2));

    return NextResponse.json({ message: 'Draft request received.' }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'We could not save your request. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
