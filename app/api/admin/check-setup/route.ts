import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/admin/check-setup - Check if admin password is set (env-var or .password file)
export async function GET() {
  let passwordSet = !!process.env.PASSWORD_HASH;
  if (!passwordSet) {
    try {
      const passwordPath = path.join(process.cwd(), '.password');
      const buf = await fs.readFile(passwordPath, 'utf8');
      passwordSet = buf.trim().length > 0;
    } catch {
      // file doesn't exist or unreadable; not set
    }
  }
  return NextResponse.json({ isPasswordSet: passwordSet });
}