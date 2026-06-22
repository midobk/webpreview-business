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

// Get password hash from file (Node.js only)
export function getPasswordHashFromFile(): string | null {
  try {
    const passwordPath = path.join(process.cwd(), '.password');
    if (fs.existsSync(passwordPath)) {
      return fs.readFileSync(passwordPath, 'utf8').trim();
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