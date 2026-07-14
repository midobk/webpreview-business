import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPasswordSet, isValidAdminSession } from '@/lib/auth-edge';

async function checkPasswordSet(req: NextRequest): Promise<boolean> {
  if (isPasswordSet()) return true;
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
  if (envSessionSecretAvailable()) return isValidAdminSession(value);
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

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const passwordIsSet = await checkPasswordSet(request);

    if (request.nextUrl.pathname === '/admin/setup') {
      if (passwordIsSet) return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.next();
    }

    if (!passwordIsSet) return NextResponse.redirect(new URL('/admin/setup', request.url));

    const session = request.cookies.get('admin_session');
    if (!session || !(await validateSessionCookie(request, session.value))) {
      if (request.nextUrl.pathname === '/admin') return NextResponse.next();
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
