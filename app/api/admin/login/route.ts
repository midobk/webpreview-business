import { NextResponse } from 'next/server';
import { verifyPassword, getPasswordHash } from '@/lib/auth';
import { createAdminSession } from '@/lib/auth-server';

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

    // Get password hash from env var or .password file (local-dev fallback)
    const passwordHash = getPasswordHash();
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

    const session = createAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Admin session secret is not configured.' }, { status: 500 });
    }

    // Set a signed session cookie (24h expiry)
    const res = NextResponse.json({ message: 'Authentication successful' }, { status: 200 });
    res.cookies.set('admin_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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

// DELETE /api/admin/login - Clear admin session cookie (logout)
export async function DELETE() {
  const res = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  res.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return res;
}
