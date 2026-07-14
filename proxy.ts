import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPasswordSet, isValidAdminSession } from '@/lib/auth-edge';
import { SITE_URL } from '@/lib/site-config';

// The middleware forwards the request Cookie to an internal /api/admin/*
// endpoint to resolve auth on the slow path (when the secret lives only in
// the .password file, which the edge cannot read). The fetch URL used to be
// built from req.url, whose origin is derived from the client-controlled
// Host header — so an attacker could set Host: 169.254.169.254 (or their own
// host) and make the middleware forward the admin cookie off-origin (blind
// SSRF + cookie exfiltration). Only fetch when the request host is one we
// trust: the canonical SITE_URL host, or localhost for dev. Otherwise deny.
function trustedRequestOrigin(req: NextRequest): string | null {
  const host = req.headers.get('host');
  if (!host) return null;
  const lower = host.toLowerCase();
  let siteHost: string | null = null;
  try {
    siteHost = new URL(SITE_URL).host.toLowerCase();
  } catch {
    siteHost = null;
  }
  const isLocalhost =
    lower === 'localhost' || lower.startsWith('localhost:') ||
    lower === '127.0.0.1' || lower.startsWith('127.0.0.1:') ||
    lower === '[::1]' || lower === '[::1]:';
  if ((siteHost && lower === siteHost) || (siteHost && lower.startsWith(siteHost + ':')) || isLocalhost) {
    return new URL(req.url).origin;
  }
  return null;
}

async function checkPasswordSet(req: NextRequest): Promise<boolean> {
  if (isPasswordSet()) return true;
  const origin = trustedRequestOrigin(req);
  if (!origin) return false;
  try {
    const url = new URL('/api/admin/check-setup', origin);
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
  const origin = trustedRequestOrigin(req);
  if (!origin) return false;
  try {
    const url = new URL('/api/admin/check-session', origin);
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
