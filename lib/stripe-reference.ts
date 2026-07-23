/**
 * Reversible encoding for the prototype slug that rides along on a Stripe
 * Payment Link checkout as `client_reference_id`.
 *
 * Stripe restricts `client_reference_id` to `[a-zA-Z0-9_-]` (max 200 chars),
 * but lead slugs may contain other characters — notably `&` (e.g.
 * `clean-&-shine-services`). The earlier lossy approach replaced every
 * non-allowed character with `-`, which made the slug unrecoverable on the
 * webhook side: `findLeadForPurchase` looked the sanitized value up verbatim
 * and never matched the original lead, so those purchases were stored with
 * `lead_id = null` and never updated lead notes/status or unlocked the
 * admin/customer portal.
 *
 * base64url fits Stripe's allowed charset exactly, so we encode the slug as
 * base64url and prefix it with `b64_`. The prefix lets the webhook tell
 * encoded references apart from legacy raw/sanitized ones (which have no
 * prefix) and decode only when appropriate — keeping the read side
 * backward-compatible with any in-flight references emitted by the old code.
 *
 * Implemented with `btoa`/`atob` + `TextEncoder`/`TextDecoder` (no Node
 * `Buffer`) so the same module runs in the browser `PurchaseCta` client
 * component and the server webhook route.
 */

const PREFIX = 'b64_';

// Stripe caps client_reference_id at 200 chars of [a-zA-Z0-9_-].
const MAX_REFERENCE_LENGTH = 200;

function toBase64Url(input: string): string {
  // UTF-8 safe: encode to bytes first, then base64.
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Encode a prototype slug for use as Stripe `client_reference_id`.
 * Returns `b64_<base64url(slug)>`. Slugs are short (`<base>-<uuid8>`), so the
 * encoded form stays well under Stripe's 200-char limit.
 *
 * Edge case: an unusually long slug (>~147 chars) would push the base64url
 * form past the 200-char cap and Stripe would reject the checkout URL
 * outright. Reversible encoding can't be truncated, so we fall back to the
 * lossy sanitize (strip to Stripe's allowed charset) — no worse than the
 * pre-encoding behaviour, and `decodeSlugReference` treats any non-`b64_`
 * value as a raw legacy reference. Real slugs never hit this branch.
 */
export function encodeSlugReference(slug: string): string {
  const encoded = `${PREFIX}${toBase64Url(slug)}`;
  if (encoded.length <= MAX_REFERENCE_LENGTH) return encoded;
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(
      `[stripe-reference] encoded slug exceeds Stripe's 200-char client_reference_id cap (${encoded.length} chars); falling back to lossy sanitize.`
    );
  }
  return slug.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, MAX_REFERENCE_LENGTH);
}

/**
 * Inverse of {@link encodeSlugReference}. Returns the original slug for any
 * `b64_`-prefixed reference; returns the input unchanged for legacy raw or
 * sanitized references (no prefix), so existing/in-flight checkouts still
 * flow through `findLeadForPurchase` as before. A malformed payload falls back
 * to the raw reference rather than throwing — the lookup then simply misses,
 * which is the safe outcome.
 */
export function decodeSlugReference(reference: string): string {
  if (!reference.startsWith(PREFIX)) return reference;
  try {
    return fromBase64Url(reference.slice(PREFIX.length));
  } catch {
    return reference;
  }
}