import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return NextResponse.json({
    url_starts_with_https: url?.startsWith('https://'),
    url_length: url?.length,
    key_length: key?.length,
    key_starts_with_ey: key?.startsWith('eyJ'),
    key_first_10: key?.substring(0, 10),
  });
}
