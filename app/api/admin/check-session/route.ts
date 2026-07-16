import { NextResponse } from 'next/server';
import { sessionSecret, isValidAdminSessionWithSecret } from '@/lib/auth-server';

// GET /api/admin/check-session - Validate the admin_session cookie using
// the secret resolved at request time (env or .password file fallback).
//
// The page middleware runs on the edge runtime, where `fs` is unavailable,
// so it cannot read ./password when ADMIN_SESSION_SECRET and PASSWORD_HASH
// are both unset. This endpoint runs on the Node runtime and resolves the
// secret in lib/auth-server before validating the cookie. The middleware
// hits this endpoint as a slow path parallel to /api/admin/check-setup.
export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  const session = match ? decodeURIComponent(match[1]) : '';
  const secret = sessionSecret();
  const isValid = isValidAdminSessionWithSecret(session, secret);
  return NextResponse.json({ isValid }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
