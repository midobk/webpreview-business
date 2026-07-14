import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const PAGE = (message: string, status = 200) => new NextResponse(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seaway Sites</title><style>body{font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:520px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;box-shadow:0 10px 30px #0f172a12}h1{font-size:22px;margin:0 0 10px}p{color:#475569;line-height:1.6}</style></head><body><main><h1>You're unsubscribed</h1><p>${message}</p></main></body></html>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
);

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('lead')?.trim() || '';
  if (!slug || slug.length > 200 || /[/%_\\]/.test(slug)) {
    return PAGE('Your preference could not be updated. Please contact us directly if you continue receiving messages.', 400);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return PAGE('Your preference could not be saved because this service is not connected to its lead database. Please contact us directly.', 503);
  }

  const { error } = await supabase
    .from('leads')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (error) {
    console.error('Unsubscribe failed:', error.message);
    return PAGE('Your preference could not be saved. Please contact us directly if you continue receiving messages.', 503);
  }

  return PAGE('You will not receive further outreach from Seaway Sites for this lead.');
}

export const dynamic = 'force-dynamic';
