import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Якщо користувач іде в адмінку (і це не сторінка входу)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;

    // Перевіряємо, чи є правильний токен у Cookie
    if (adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      // Якщо немає — відправляємо на сторінку входу
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Вказуємо, які саме шляхи перевіряти
export const config = {
  matcher: ['/admin/:path*'],
};