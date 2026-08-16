import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;

    if (adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};