import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// POST /api/admin/setup - Set up admin password
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

    // Check if PASSWORD_HASH is already set in environment variables
    if (process.env.PASSWORD_HASH) {
      return NextResponse.json(
        { error: 'Admin password is already configured' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // In a real application, you would save this to a database or secure storage
    // For this simple implementation, we'll save it to a file
    const passwordPath = path.join(process.cwd(), '.password');
    fs.writeFileSync(passwordPath, hashedPassword);

    // Return success response
    return NextResponse.json(
      { message: 'Admin password set successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up admin password' },
      { status: 500 }
    );
  }
}