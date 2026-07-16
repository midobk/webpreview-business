import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_VERSION = 1;
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30;

type DraftPreviewPayload = {
  v: number;
  slug: string;
  exp: number;
};

/**
 * Dedicated signing secret for draft preview tokens and outreach unsubscribe
 * signatures. This MUST be set as DRAFT_PREVIEW_SECRET (or OUTREACH_SIGNING_SECRET
 * as alias) in both the outreach runtime and the deployment so that tokens
 * minted locally are valid on Vercel and vice-versa. The admin password hash
 * is NOT used because bcrypt salts make local and production hashes different
 * even for the same password, which would invalidate every signed link.
 */
function previewSecret(): string {
  return (
    process.env.DRAFT_PREVIEW_SECRET ||
    process.env.OUTREACH_SIGNING_SECRET ||
    ''
  );
}

export function createDraftPreviewToken(
  slug: string,
  now = Math.floor(Date.now() / 1000),
  ttlSeconds = DEFAULT_TTL_SECONDS,
): string | null {
  const secret = previewSecret();
  if (!secret || !slug || ttlSeconds <= 0) return null;

  const payload: DraftPreviewPayload = {
    v: TOKEN_VERSION,
    slug,
    exp: now + ttlSeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`draft-preview:${encodedPayload}`)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function isValidDraftPreviewToken(
  slug: string,
  token: string | null | undefined,
  now = Math.floor(Date.now() / 1000),
): boolean {
  const secret = previewSecret();
  if (!secret || !slug || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as Partial<DraftPreviewPayload>;

    if (
      payload.v !== TOKEN_VERSION ||
      payload.slug !== slug ||
      !Number.isInteger(payload.exp) ||
      (payload.exp as number) <= now
    ) {
      return false;
    }

    const expected = createHmac('sha256', secret)
      .update(`draft-preview:${encodedPayload}`)
      .digest('base64url');
    const actualBytes = Buffer.from(signature);
    const expectedBytes = Buffer.from(expected);

    return (
      actualBytes.length === expectedBytes.length &&
      timingSafeEqual(actualBytes, expectedBytes)
    );
  } catch {
    return false;
  }
}
