// Server-side admin auth helper for API routes.
// Verifies the admin_session cookie is present AND valid.
// On failure, returns a NextResponse with 401.
// On success, returns null and the caller proceeds.
//
// IMPORTANT: This is server-only (uses next/server). Do not import from middleware.

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const ADMIN_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24;
const LOCAL_PASSWORD_PATH = path.join(process.cwd(), '.password');

/**
 * Resolve the HMAC secret used to sign the admin session cookie.
 *
 * Priority:
 *   1. process.env.ADMIN_SESSION_SECRET (explicit, recommended)
 *   2. process.env.PASSWORD_HASH (already loaded by the app for login)
 *   3. The contents of the local .password file. After the setup wizard
 *      runs, this file holds the bcrypt hash; that hash is high-entropy
 *      enough to act as an HMAC key. Reading it here keeps the supported
 *      file-only local-dev setup (no env vars) producing a valid session.
 */
export function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.PASSWORD_HASH ||
    readLocalPasswordSecret()
  );
}

function readLocalPasswordSecret(): string {
  try {
    if (existsSync(LOCAL_PASSWORD_PATH)) {
      const value = readFileSync(LOCAL_PASSWORD_PATH, 'utf8').trim();
      if (value) return value;
    }
  } catch {
    // unreadable; fall through to empty string
  }
  return '';
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

/** Reject cross-origin state-changing admin requests when the browser supplies Origin. */
export function requireSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  try {
    if (origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: 'Cross-origin request blocked.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  return null;
}

/**
 * Node-runtime admin session check. Unlike lib/auth-edge's variant, this
 * resolves the secret through sessionSecret(), so it also works in the
 * supported file-only local setup where the secret lives in ./.password
 * and no env vars are set.
 */
export function isValidAdminSession(value?: string) {
  if (!value) return false;
  // Resolve the secret once. When no secret is configured (setup/misconfigured
  // state: ADMIN_SESSION_SECRET, PASSWORD_HASH, and ./.password all absent),
  // sessionSecret() returns '' — we must reject before computing the HMAC,
  // otherwise a caller could forge an admin_session offline with the empty key.
  const secret = sessionSecret();
  if (!secret) return false;
  const [encodedPayload, signature] = value.split('.');
  if (!encodedPayload || !signature) return false;
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const [issuedAt, expiresAt] = payload.split('.').map(Number);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return false;
    if (expiresAt <= now || issuedAt > now + 60) return false;
    const expected = createHmac('sha256', secret).update(payload).digest('base64url');
    const actualBytes = Buffer.from(signature);
    const expectedBytes = Buffer.from(expected);
    return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
  } catch {
    return false;
  }
}

/**
 * Same validation as `isValidAdminSession`, but the caller supplies the
 * secret explicitly. Used by the /api/admin/check-session route so that
 * the middleware can validate sessions even when the secret lives only in
 * the .password file (which the edge runtime cannot read).
 */
export function isValidAdminSessionWithSecret(value: string | undefined, secret: string) {
  if (!value || !secret) return false;
  const [encodedPayload, signature] = value.split('.');
  if (!encodedPayload || !signature) return false;
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const [issuedAt, expiresAt] = payload.split('.').map(Number);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return false;
    if (expiresAt <= now || issuedAt > now + 60) return false;
    const expected = createHmac('sha256', secret).update(payload).digest('base64url');
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
