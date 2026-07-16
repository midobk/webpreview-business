// Node.js-only auth utilities (for API routes — NOT for middleware)
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify a password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Bcrypt hashes look like `$2a$NN$…`, `$2b$NN$…`, `$2x$NN$…`, `$2y$NN$…`,
// where NN is the cost factor and the rest is a 53-char base64-ish payload.
// Reject anything that is not a real bcrypt hash, so a misconfigured dev
// environment that wrote `PLAINTEXT=1234` (or any non-bcrypt placeholder)
// cannot be passed to bcrypt.compare and silently fail every login. This
// keeps the .password fallback symmetric with the HMAC-secret resolution
// in lib/auth-server.ts: either the file is a real bcrypt hash, or the
// fallback returns null.
const BCRYPT_HASH_PATTERN = /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/;

// Get password hash from file (Node.js only)
export function getPasswordHashFromFile(): string | null {
  try {
    const passwordPath = path.join(process.cwd(), '.password');
    if (fs.existsSync(passwordPath)) {
      const value = fs.readFileSync(passwordPath, 'utf8').trim();
      if (BCRYPT_HASH_PATTERN.test(value)) return value;
    }
  } catch (error) {
    console.error('Error reading password file:', error);
  }
  return null;
}

// Get password hash from env or file (Node.js context only)
export function getPasswordHash(): string | null {
  if (process.env.PASSWORD_HASH) {
    return process.env.PASSWORD_HASH;
  }
  return getPasswordHashFromFile();
}

// Check if admin password is set (Node.js context)
export function isPasswordSet(): boolean {
  return getPasswordHash() !== null;
}

// Alias for clarity
export function isPasswordSetNode(): boolean {
  return isPasswordSet();
}