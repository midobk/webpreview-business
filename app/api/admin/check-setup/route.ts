import { NextResponse } from 'next/server';
import { isPasswordSet } from '@/lib/auth';

// GET /api/admin/check-setup - Check if admin password is set
export async function GET() {
  try {
    const passwordSet = isPasswordSet();
    
    return NextResponse.json(
      { isPasswordSet: passwordSet },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check setup error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}