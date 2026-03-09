import { NextResponse } from 'next/server';
export function proxy(request) {
    var _a;
    const role = (_a = request.cookies.get('auth_role')) === null || _a === void 0 ? void 0 : _a.value;
    const isLoginPage = request.nextUrl.pathname === '/login';
    if (!role && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role && isLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Regular users cannot access admin pages (although this app doesn't have them, good practice)
    if (role === 'super-admin') {
        // In a real monorepo, you might redirect to the admin subdomain or similar
    }
    return NextResponse.next();
}
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
