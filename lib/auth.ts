import bcrypt from 'bcrypt';

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify a password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Check if the user is authenticated
export function isAuthenticated(request: Request): boolean {
  // In a real application, you would check for a valid session or token
  // For this simple implementation, we'll just check if a password hash is set in env
  return process.env.PASSWORD_HASH !== undefined && process.env.PASSWORD_HASH.length > 0;
}