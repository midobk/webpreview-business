// Signed unsubscribe tokens.
//
// /api/unsubscribe used to accept a bare lead slug as the only credential.
// Slugs are exposed in public /preview/<slug> URLs, so anyone who learned a
// slug could silently unsubscribe that lead. The token is now an HMAC over
// the slug using the admin session secret, so a URL can only be produced by
// something that holds the secret (the outreach generator), not forged from
// a leaked slug.
//
// Uses only node:crypto — no next/server — so it is safe to import from both
// API routes and the Node outreach scripts.
//
// The signing secret is DRAFT_PREVIEW_SECRET (or OUTREACH_SIGNING_SECRET alias),
// shared with the outreach runtime and the deployment. The admin password hash
// is NOT used because bcrypt salts make local and production hashes different
// even for the same password, which would invalidate every signed link.

import { createHmac, timingSafeEqual } from 'node:crypto';

function signingSecret(): string {
  return process.env.DRAFT_PREVIEW_SECRET || process.env.OUTREACH_SIGNING_SECRET || '';
}

export function signUnsubscribeToken(slug: string): string {
  const secret = signingSecret();
  if (!secret) return '';
  return createHmac('sha256', secret).update(slug).digest('base64url');
}

export function verifyUnsubscribeToken(slug: string, sig: string | null): boolean {
  if (!sig) return false;
  const secret = signingSecret();
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(slug).digest('base64url');
  try {
    const actualBytes = Buffer.from(sig);
    const expectedBytes = Buffer.from(expected);
    return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
  } catch {
    return false;
  }
}