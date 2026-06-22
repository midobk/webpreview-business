import { NextResponse } from 'next/server';

// GET /api/admin/check-setup - Check if admin password is set (env-var only, Vercel-safe)
export async function GET() {
  const passwordSet = !!process.env.PASSWORD_HASH;
  return NextResponse.json({ isPasswordSet: passwordSet });
}