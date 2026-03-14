import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/forbidden'];

const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'dashboard:read',
  '/leads': 'leads:read',
  '/opportunities': 'opportunities:read',
  '/tasks': 'tasks:read',
  '/reports': 'reports:read',
  '/contacts': 'contacts:read',
  '/messages': 'messages:read',
  '/configuration': 'configuration:read',
  '/invoice': 'invoice:read',
  '/users': 'users:read',
  '/permissions': 'permissions:read',
  '/audit-log': 'audit:read',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // The actual permission check happens server-side via API
  // Here we just ensure the user has a session cookie
  const hasRefreshToken = request.cookies.has('refresh_token');

  if (!hasRefreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};