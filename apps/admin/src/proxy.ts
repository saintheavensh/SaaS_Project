import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const role = request.cookies.get('admin_auth_role')?.value;
    const isLoginPage = request.nextUrl.pathname === '/login';

    if (!role && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (role && isLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Only super-admins allowed
    if (role !== 'super-admin' && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
