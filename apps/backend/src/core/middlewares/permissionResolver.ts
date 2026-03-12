import { eq } from 'drizzle-orm';
import { Context } from 'hono';
import { db } from '../db.js';
import { userRoles, rolePermissions, permissions } from '@my-saas-app/db';

/**
 * Resolve all permission names for a given user by traversing:
 * user_roles → role_permissions → permissions
 *
 * Uses a single JOIN query with DISTINCT to avoid duplicates.
 * Supports request-level caching via the Hono Context to prevent
 * redundant database queries when multiple permission checks occur
 * in a single request.
 */
export const resolveUserPermissions = async (userId: string, c?: Context): Promise<string[]> => {
    // Request-level cache: if permissions were already resolved, return them
    if (c) {
        const cached = c.get('permissions') as string[] | undefined;
        if (cached) {
            return cached;
        }
    }

    const results = await db
        .selectDistinct({ name: permissions.name })
        .from(userRoles)
        .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, userId));

    const permissionNames = results.map(r => r.name);

    // Store in request-level cache
    if (c) {
        c.set('permissions', permissionNames);
    }

    return permissionNames;
};
