import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin Proxy Middleware
 * Handles session protection and role-based access control for the admin dashboard.
 */
export function proxy(request: NextRequest) {
    const role = request.cookies.get('admin_auth_role')?.value;
    const { pathname } = request.nextUrl;
    const isLoginPage = pathname === '/login';

    // 1. Redirect authenticated users away from the login page
    if (isLoginPage && role) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. Allow public access to the login page
    if (isLoginPage) {
        return NextResponse.next();
    }

    // 3. Prevent unauthenticated access to protected routes
    if (!role) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Authorization: Only 'super-admin' is allowed in the admin portal
    if (role !== 'super-admin') {
        // Log out or redirect to a 'forbidden' page if unauthorized role found
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin_auth_role'); // Clear invalid role session
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
