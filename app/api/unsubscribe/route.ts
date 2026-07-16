import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token';

const PAGE = (heading: string, message: string, status = 200) => new NextResponse(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seaway Sites</title><style>body{font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:520px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;box-shadow:0 10px 30px #0f172a12}h1{font-size:22px;margin:0 0 10px}p{color:#475569;line-height:1.6}</style></head><body><main><h1>${heading}</h1><p>${message}</p></main></body></html>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('lead')?.trim() || '';
  const sig = url.searchParams.get('sig');
  if (!slug || slug.length > 200 || /[/%_\\]/.test(slug)) {
    return PAGE('Unsubscribe failed', 'Your preference could not be updated. Please contact us directly if you continue receiving messages.', 400);
  }
  // Require a signed token. A bare slug is no longer enough — slugs are
  // exposed in public /preview/<slug> URLs, so without a signature anyone
  // could unsubscribe a lead by guessing/leaking its slug.
  if (!verifyUnsubscribeToken(slug, sig)) {
    return PAGE('Unsubscribe failed', 'This unsubscribe link is invalid or has expired. Please reply to the email you received and we will remove you manually.', 403);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return PAGE('Unsubscribe failed', 'Your preference could not be saved because this service is not connected to its lead database. Please contact us directly.', 503);
  }

  const { error } = await supabase
    .from('leads')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (error) {
    console.error('Unsubscribe failed:', error.message);
    return PAGE('Unsubscribe failed', 'Your preference could not be saved. Please contact us directly if you continue receiving messages.', 503);
  }

  return PAGE("You're unsubscribed", 'You will not receive further outreach from Seaway Sites for this lead.');
}

export const dynamic = 'force-dynamic';
