// Server-side admin auth helper for API routes.
// Verifies the admin_session cookie is present AND valid.
// On failure, returns a NextResponse with 401.
// On success, returns null and the caller proceeds.
//
// IMPORTANT: This is server-only (uses next/server). Do not import from middleware.

import { NextResponse } from 'next/server';

const ADMIN_COOKIE = 'admin_session';
const ADMIN_COOKIE_VALUE = 'authenticated';

/**
 * Returns a 401 NextResponse if the request is not from an authenticated admin.
 * Returns null if the request is authenticated and may proceed.
 *
 * Usage in API route:
 *   const denied = requireAdmin(request);
 *   if (denied) return denied;
 */
export function requireAdmin(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const session = cookies[ADMIN_COOKIE];
  if (session !== ADMIN_COOKIE_VALUE) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Lightweight cookie parser (avoids importing next/headers into edge-ish code paths).
 * Sufficient for matching the single admin_session cookie name.
 */
function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) out[name] = decodeURIComponent(value);
  }
  return out;
}
