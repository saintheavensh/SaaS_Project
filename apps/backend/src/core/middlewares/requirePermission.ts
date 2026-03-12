import { Context, Next } from 'hono';
import { resolveUserPermissions } from './permissionResolver.js';
import { errorResponse } from '../utils/response.js';
import { AppEnv } from '../types/app-env.js';
import { Permission } from '../auth/permission.types.js';

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
export const requirePermission = (permissionName: Permission) => {
    return async (c: Context<AppEnv>, next: Next): Promise<void | Response> => {
        const userId = c.get('userId');
        const tenantId = c.get('tenantId');

        if (!userId || !tenantId) {
            return c.json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required'
            }, 401);
        }

        const userPermissions = await resolveUserPermissions(userId, tenantId, c);

        if (!userPermissions.includes(permissionName as any)) { // Cast as any temporarily if userPermissions is still string[] until step 3
            return c.json({
                error: 'FORBIDDEN',
                message: 'You do not have permission to perform this action'
            }, 403);
        }

        await next();
    };
};
