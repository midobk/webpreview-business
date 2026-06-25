import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { hashPassword } from '@/lib/auth';

// POST /api/admin/setup - Set up admin password
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

    // Check if PASSWORD_HASH is already set in environment variables OR if
    // a ./.password file exists locally. Either condition means an admin
    // password is already configured — reject the setup request so an
    // unauthenticated POST can't overwrite the existing hash.
    if (process.env.PASSWORD_HASH) {
      return NextResponse.json(
        { error: 'Admin password is already configured' },
        { status: 400 }
      );
    }
    const localPasswordPath = path.join(process.cwd(), '.password');
    let localPasswordExists = false;
    try {
      await fs.access(localPasswordPath);
      localPasswordExists = true;
    } catch {
      // file doesn't exist; setup is allowed
    }
    if (localPasswordExists) {
      return NextResponse.json(
        {
          error:
            'Admin password is already configured locally (./.password exists). ' +
            'To rotate it, delete ./.password and restart the server, or update PASSWORD_HASH env var.',
        },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // On Vercel (serverless), we can't write files.
    // Return the hash so the user can set it as an env var.
    // Locally (dev or `next start`), write the hash to ./.password so the
    // login flow works without a redeploy. Detect "local" by checking for
    // the Vercel env var, which is only set in their serverless runtime.
    let localFileWritten = false;
    const isVercel = !!process.env.VERCEL;
    if (!isVercel) {
      try {
        await fs.writeFile(localPasswordPath, hashedPassword + '\n', { mode: 0o600 });
        localFileWritten = true;
      } catch (e) {
        // best-effort; non-fatal
        console.error('Failed to write .password file:', e);
      }
    }

    return NextResponse.json(
      {
        message: localFileWritten
          ? 'Password hashed and saved to ./.password (local dev). For Vercel, set PASSWORD_HASH env var and redeploy.'
          : 'Password hashed successfully',
        hash: hashedPassword,
        instructions: 'Set this as a Vercel environment variable named PASSWORD_HASH, then redeploy.',
        localFileWritten,
      },
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

// GET /api/admin/setup - Check if setup is needed
export async function GET() {
  const passwordSet = !!process.env.PASSWORD_HASH;
  return NextResponse.json({ passwordSet });
}