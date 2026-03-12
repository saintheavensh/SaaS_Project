import { eq, and } from 'drizzle-orm';
import { Context } from 'hono';
import { db } from '../db.js';
import { userRoles, rolePermissions, permissions, roles } from '@my-saas-app/db';
import { AppEnv } from '../types/app-env.js';
import { Permission } from '../auth/permission.types.js';

/**
 * Resolve all permission names for a given user by traversing:
 * user_roles → roles (tenant filter) → role_permissions → permissions
 *
 * Uses a single JOIN query with DISTINCT to avoid duplicates.
 * Supports request-level caching via the Hono Context to prevent
 * redundant database queries when multiple permission checks occur
 * in a single request.
 *
 * Tenant safety: Only resolves permissions from roles that belong to
 * the same tenant as the authenticated user. This prevents cross-tenant
 * privilege escalation.
 */
export const resolveUserPermissions = async (
    userId: string,
    tenantId: string,
    c?: Context<AppEnv>
): Promise<Permission[]> => {
    // Request-level cache: if permissions were already resolved, return them
    if (c) {
        const cached = c.get('permissions');
        if (cached) {
            return cached;
        }
    }

    // Single optimized JOIN: user_roles → roles (tenant-scoped) → role_permissions → permissions
    const results = await db
        .selectDistinct({ name: permissions.name })
        .from(userRoles)
        .innerJoin(roles, and(
            eq(userRoles.roleId, roles.id),
            eq(roles.tenantId, tenantId)
        ))
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, userId));

    const permissionNames = results.map(r => r.name as Permission);

    // Store in request-level cache
    if (c) {
        c.set('permissions', permissionNames);
    }

    return permissionNames;
};
