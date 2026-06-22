import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPasswordSet } from '@/lib/auth-edge';

export function middleware(request: NextRequest) {
  // Skip API routes, static files
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) {
    return NextResponse.next();
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow setup page
    if (request.nextUrl.pathname === '/admin/setup') {
      // If password is already set, redirect to login
      if (isPasswordSet()) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // If password not set, redirect to setup
    if (!isPasswordSet()) {
      return NextResponse.redirect(new URL('/admin/setup', request.url));
    }

    // Check session cookie for protected admin pages
    const session = request.cookies.get('admin_session');
    if (!session || session.value !== 'authenticated') {
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