import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { Role } from '@/types';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const ROLE_HOME: Record<Role, string> = {
  admin: '/admin/dashboard',
  am:    '/am/dashboard',
  tsc:   '/tsc/dashboard',
  ba:    '/ba/dashboard',
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('gmpl_token')?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/ba')    ||
      pathname.startsWith('/am')    ||
      pathname.startsWith('/tsc')
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userRole = payload.role as Role;

    if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
      return NextResponse.redirect(new URL(ROLE_HOME[userRole] || '/login', request.url));
    }

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL(ROLE_HOME[userRole] || '/login', request.url));
    }
    if (pathname.startsWith('/ba') && userRole !== 'ba') {
      return NextResponse.redirect(new URL(ROLE_HOME[userRole] || '/login', request.url));
    }
    if (pathname.startsWith('/am') && userRole !== 'am') {
      return NextResponse.redirect(new URL(ROLE_HOME[userRole] || '/login', request.url));
    }
    if (pathname.startsWith('/tsc') && userRole !== 'tsc') {
      return NextResponse.redirect(new URL(ROLE_HOME[userRole] || '/login', request.url));
    }

    return NextResponse.next();
  } catch (_err: unknown) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('gmpl_token');
    return response;
  }
}

export const config = {
  matcher: ['/', '/login', '/signup', '/admin/:path*', '/ba/:path*', '/am/:path*', '/tsc/:path*'],
};
