import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPasswordSet } from '@/lib/auth';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) {
    return NextResponse.next();
  }

  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to setup page if password is not set
    if (request.nextUrl.pathname === '/admin/setup') {
      return NextResponse.next();
    }
    
    // Check if password is set
    const passwordSet = isPasswordSet();
    
    // If password is not set and not accessing setup page, redirect to setup
    if (!passwordSet && request.nextUrl.pathname !== '/admin/setup') {
      return NextResponse.redirect(new URL('/admin/setup', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};