import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPasswordSet, isValidAdminSession } from '@/lib/auth-edge';

async function checkPasswordSet(req: NextRequest): Promise<boolean> {
  // Fast path: env var is set (Vercel + local with .env)
  if (isPasswordSet()) return true;
  // Slow path: read .password file via local API route (Node runtime has fs access)
  try {
    const url = new URL('/api/admin/check-setup', req.url);
    const res = await fetch(url, { headers: { cookie: req.headers.get('cookie') || '' } });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.isPasswordSet;
  } catch {
    return false;
  }
}

function envSessionSecretAvailable(): boolean {
  return !!(process.env.ADMIN_SESSION_SECRET || process.env.PASSWORD_HASH);
}

async function validateSessionCookie(req: NextRequest, value: string): Promise<boolean> {
  // Fast path: secret is in the env (Vercel + .env.local). The edge
  // validator handles HMAC verification using Web Crypto.
  if (envSessionSecretAvailable()) {
    return isValidAdminSession(value);
  }
  // Slow path: secret lives only in ./password. The edge runtime cannot
  // read the filesystem, so delegate to the Node-runtime endpoint.
  try {
    const url = new URL('/api/admin/check-session', req.url);
    const res = await fetch(url, { headers: { cookie: req.headers.get('cookie') || '' } });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.isValid;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Skip API routes, static files
  if (request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) {
    return NextResponse.next();
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const passwordIsSet = await checkPasswordSet(request);

    // Allow setup page
    if (request.nextUrl.pathname === '/admin/setup') {
      // If password is already set, redirect to login
      if (passwordIsSet) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // If password not set, redirect to setup
    if (!passwordIsSet) {
      return NextResponse.redirect(new URL('/admin/setup', request.url));
    }

    // Check session cookie for protected admin pages
    const session = request.cookies.get('admin_session');
    if (!session || !(await validateSessionCookie(request, session.value))) {
      // Allow the login page itself
      if (request.nextUrl.pathname === '/admin') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
