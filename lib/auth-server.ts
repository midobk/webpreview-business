// Server-side admin auth helper for API routes.
// Verifies the admin_session cookie is present AND valid.
// On failure, returns a NextResponse with 401.
// On success, returns null and the caller proceeds.
//
// IMPORTANT: This is server-only (uses next/server). Do not import from middleware.

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const ADMIN_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.PASSWORD_HASH || '';
}

export function createAdminSession(now = Math.floor(Date.now() / 1000)) {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = `${now}.${now + SESSION_TTL_SECONDS}`;
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

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
  if (!isValidAdminSession(session)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}

function isValidAdminSession(value?: string) {
  if (!value) return false;
  const [encodedPayload, signature] = value.split('.');
  if (!encodedPayload || !signature) return false;
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const [issuedAt, expiresAt] = payload.split('.').map(Number);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return false;
    if (expiresAt <= now || issuedAt > now + 60) return false;
    const expected = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
    const actualBytes = Buffer.from(signature);
    const expectedBytes = Buffer.from(expected);
    return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
  } catch {
    return false;
  }
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
