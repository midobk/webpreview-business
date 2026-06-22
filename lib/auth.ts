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

// Get the password hash
export function getPasswordHash(): string | null {
  // First check environment variable
  if (process.env.PASSWORD_HASH) {
    return process.env.PASSWORD_HASH;
  }
  
  // Then check password file
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

// Check if admin password is set
export function isPasswordSet(): boolean {
  return getPasswordHash() !== null;
}