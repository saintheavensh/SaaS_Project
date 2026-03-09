import { eq, and } from 'drizzle-orm';
import { db } from '../../core/db.js';
import { rolePermissions, permissions } from '@my-saas-app/db';

/**
 * Assign a permission to a role
 */
export const assignPermissionToRole = async (roleId: string, permissionId: string): Promise<void> => {
    await db.insert(rolePermissions)
        .values({
            roleId,
            permissionId,
        })
        .onConflictDoNothing();
};

/**
 * Remove a permission from a role
 */
export const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
    await db.delete(rolePermissions)
        .where(
            and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionId, permissionId)
            )
        );
};

/**
 * Get all permissions assigned to a specific role
 */
export const getPermissionsByRole = async (roleId: string) => {
    const results = await db
        .select({
            id: permissions.id,
            name: permissions.name,
            description: permissions.description,
            createdAt: permissions.createdAt,
            updatedAt: permissions.updatedAt,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleId));

    return results.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));
};
