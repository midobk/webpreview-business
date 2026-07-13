// Edge-safe auth utilities (for middleware use)
// Only uses env vars — no fs/path/process.cwd

export function isPasswordSet(): boolean {
  return !!process.env.PASSWORD_HASH;
}

export function getPasswordHashFromEnv(): string | null {
  if (process.env.PASSWORD_HASH) {
    return process.env.PASSWORD_HASH;
  }
  return null;
}

const SESSION_TTL_SECONDS = 60 * 60 * 24;

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/** Validate the HMAC session created by lib/auth-server without Node-only APIs. */
export async function isValidAdminSession(value?: string): Promise<boolean> {
  if (!value) return false;
  const [encodedPayload, signature] = value.split('.');
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.PASSWORD_HASH;
  if (!encodedPayload || !signature || !secret) return false;

  try {
    const payload = new TextDecoder().decode(base64UrlToBytes(encodedPayload));
    const [issuedAt, expiresAt] = payload.split('.').map(Number);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return false;
    if (expiresAt <= now || issuedAt > now + 60) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    return crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}
