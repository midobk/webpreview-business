import { createHmac, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const TOKEN_VERSION = 1;
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30;
const LOCAL_PASSWORD_PATH = path.join(process.cwd(), '.password');

type DraftPreviewPayload = {
  v: number;
  slug: string;
  exp: number;
};

function previewSecret(): string {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (process.env.PASSWORD_HASH) return process.env.PASSWORD_HASH;

  try {
    if (existsSync(LOCAL_PASSWORD_PATH)) {
      const value = readFileSync(LOCAL_PASSWORD_PATH, 'utf8').trim();
      if (value) return value;
    }
  } catch {
    // Unreadable local password file; fail closed below.
  }

  return '';
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
