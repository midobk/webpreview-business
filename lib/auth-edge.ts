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