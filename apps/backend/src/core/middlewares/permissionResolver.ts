import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { userRoles, rolePermissions, permissions } from '@my-saas-app/db';

/**
 * Resolve all permission names for a given user by traversing:
 * user_roles → role_permissions → permissions
 *
 * Uses a single JOIN query with implicit DISTINCT via Set to avoid duplicates.
 */
export const resolveUserPermissions = async (userId: string): Promise<string[]> => {
    const results = await db
        .selectDistinct({ name: permissions.name })
        .from(userRoles)
        .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, userId));

    return results.map(r => r.name);
};
