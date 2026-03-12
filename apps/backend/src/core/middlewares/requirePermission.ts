import { Context, Next } from 'hono';
import { resolveUserPermissions } from './permissionResolver.js';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware factory that enforces a specific permission on a route.
 *
 * Usage: requirePermission('tenant.create')
 *
 * 1. Reads userId and tenantId from the authenticated context (set by authMiddleware).
 * 2. Resolves user permissions via the permission resolver (with request-level cache).
 * 3. Checks if the required permission exists in the resolved list.
 * 4. Returns 403 if missing; calls next() if present.
 */
export const requirePermission = (permissionName: string) => {
    return async (c: Context, next: Next): Promise<void | Response> => {
        const userId = c.get('userId') as string | undefined;
        const tenantId = c.get('tenantId') as string | undefined;

        if (!userId || !tenantId) {
            return errorResponse(c, 'Unauthorized', 'Authentication required', 401);
        }

        const userPermissions = await resolveUserPermissions(userId, tenantId, c);

        if (!userPermissions.includes(permissionName)) {
            return errorResponse(c, 'Forbidden', 'Missing required permission', 403);
        }

        await next();
    };
};
