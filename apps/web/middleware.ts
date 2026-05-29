import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/onboarding',
  '/login',
  '/register',
  '/privacy',
  '/terms',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets, Next internals, API proxy — skip entirely
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Always allow public pages
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get('elitutor-token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  // Root path: show landing page for visitors, route by role for logged-in
  if (pathname === '/') {
    if (token) {
      const role = req.cookies.get('elitutor-role')?.value;
      const dest = role === 'PARENT' ? '/parent' : '/home';
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // Parent routes require PARENT role
  if (pathname.startsWith('/parent')) {
    const role = req.cookies.get('elitutor-role')?.value;
    if (token && role !== 'PARENT') {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  // Protected routes without token → onboarding (not login, better UX)
  if (!token) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
