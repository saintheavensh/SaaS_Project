import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { errorResponse } from '../utils/response.js';

/**
 * Authentication middleware - Verifies JWT from HTTP-only cookie and injects user into context
 */
export const authMiddleware = async (c: Context, next: Next): Promise<void | Response> => {
    const token = getCookie(c, 'auth_token');

    if (!token) {
        // Fallback to Header for non-browser clients if needed, 
        // but requirement says use HTTP-only cookies.
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return processToken(c, next, authHeader.split(' ')[1]);
        }

        return errorResponse(c, 'Unauthorized', 'No valid session found', 401);
    }

    return processToken(c, next, token);
};

async function processToken(c: Context, next: Next, token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is missing');
    }

    try {
        const payload = await verify(token, secret, 'HS256');
        c.set('jwtPayload', payload);
        c.set('userId', payload.sub);
        c.set('role', payload.role);
        c.set('tenantId', payload.tenantId);

        await next();
    } catch (e) {
        return errorResponse(c, 'Unauthorized', 'Invalid or expired session', 401);
    }
}
