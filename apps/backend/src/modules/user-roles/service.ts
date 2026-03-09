import { eq, and } from 'drizzle-orm';
import { db } from '../../core/db.js';
import { userRoles, roles } from '@my-saas-app/db';

/**
 * Assign a role to a user
 */
export const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
    await db.insert(userRoles)
        .values({
            userId,
            roleId,
        })
        .onConflictDoNothing();
};

/**
 * Remove a role from a user
 */
export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
    await db.delete(userRoles)
        .where(
            and(
                eq(userRoles.userId, userId),
                eq(userRoles.roleId, roleId)
            )
        );
};

/**
 * Get all roles assigned to a user
 */
export const getRolesByUser = async (userId: string) => {
    const results = await db
        .select({
            id: roles.id,
            name: roles.name,
            description: roles.description,
            createdAt: roles.createdAt,
            updatedAt: roles.updatedAt,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));

    return results.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    }));
};
