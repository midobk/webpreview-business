import { NextResponse } from 'next/server';
import { verifyPassword, getPasswordHash } from '@/lib/auth';

// POST /api/admin/login - Authenticate admin user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Check if password is provided
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get password hash
    const passwordHash = getPasswordHash();
    if (!passwordHash) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
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

    // In a real application, you would set a session cookie here
    // For this simple implementation, we'll just return success
    return NextResponse.json(
      { message: 'Authentication successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}