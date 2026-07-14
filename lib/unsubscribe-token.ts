// Signed unsubscribe tokens.
//
// /api/unsubscribe used to accept a bare lead slug as the only credential.
// Slugs are exposed in public /preview/<slug> URLs, so anyone who learned a
// slug could silently unsubscribe that lead. The token is now an HMAC over
// the slug using the admin session secret, so a URL can only be produced by
// something that holds the secret (the outreach generator), not forged from
// a leaked slug.
//
// Uses only node:crypto + the shared sessionSecret() — no next/server — so it
// is safe to import from both API routes and the Node outreach scripts.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { sessionSecret } from './auth-server';

export function signUnsubscribeToken(slug: string): string {
  const secret = sessionSecret();
  if (!secret) return '';
  return createHmac('sha256', secret).update(slug).digest('base64url');
}

export function verifyUnsubscribeToken(slug: string, sig: string | null): boolean {
  if (!sig) return false;
  const expected = signUnsubscribeToken(slug);
  if (!expected) return false;
  try {
    const actualBytes = Buffer.from(sig);
    const expectedBytes = Buffer.from(expected);
    return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
  } catch {
    return false;
  }
}