import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { hashPassword } from '@/lib/auth';
import { rateLimited, requestIp } from '@/lib/request-guard';

// POST /api/admin/setup - Set up admin password
export async function POST(request: Request) {
  try {
    if (rateLimited(`admin-setup:${requestIp(request)}`, 3, 10 * 60_000)) {
      return NextResponse.json({ error: 'Too many setup attempts. Please try again later.' }, { status: 429 });
    }
    if (Number(request.headers.get('content-length') || 0) > 4_000) {
      return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    }
    const body = await request.json();
    const { password } = body;

    if (typeof password !== 'string' || !password || password.length > 200) {
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

    // On Vercel (serverless), we can't write files. Never return a password
    // hash to an unauthenticated browser; configure PASSWORD_HASH out of band.
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

    if (!localFileWritten) {
      return NextResponse.json(
        { error: 'This deployment cannot persist setup credentials. Generate a bcrypt hash locally and set PASSWORD_HASH in the deployment environment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: 'Password hashed and saved to ./.password (local dev). Set PASSWORD_HASH in your deployment environment before deploying.',
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
