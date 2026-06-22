import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';

// POST /api/admin/login - Authenticate admin user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get password hash from env var (Vercel-safe)
    const passwordHash = process.env.PASSWORD_HASH;
    if (!passwordHash) {
      return NextResponse.json(
        { error: 'Admin password not configured. Set PASSWORD_HASH env var.' },
        { status: 500 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Set a simple session cookie (24h expiry)
    const res = NextResponse.json({ message: 'Authentication successful' }, { status: 200 });
    res.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}