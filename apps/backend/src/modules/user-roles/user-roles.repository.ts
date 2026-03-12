import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { db } from '../../core/db.js';
import { userRoles, users, roles } from '@my-saas-app/db';

export class UserRolesRepository extends TenantRepository {
    constructor(tenantId: string) {
        super(db as unknown as Database, tenantId);
    }

    private async verifyOwnership(userId: string, roleId: string) {
        // Verify user belongs to tenant
        const [user] = await this.db.select().from(users).where(
            and(
                eq(users.id, userId),
                this.tenantWhere(users.tenantId)
            )
        ).limit(1);

        if (!user) throw new Error('User not found or does not belong to this tenant');

        // Verify role belongs to tenant
        const [role] = await this.db.select().from(roles).where(
            and(
                eq(roles.id, roleId),
                this.tenantWhere(roles.tenantId)
            )
        ).limit(1);

        if (!role) throw new Error('Role not found or does not belong to this tenant');
    }

    async assignRole(userId: string, roleId: string): Promise<void> {
        await this.verifyOwnership(userId, roleId);

        await this.db.insert(userRoles).values({
            userId,
            roleId,
        }).onConflictDoNothing();
    }

    async removeRole(userId: string, roleId: string): Promise<void> {
        await this.verifyOwnership(userId, roleId);

        await this.db.delete(userRoles).where(
            and(
                eq(userRoles.userId, userId),
                eq(userRoles.roleId, roleId)
            )
        );
    }

    async getRolesByUser(userId: string) {
        // Ensure user belongs to tenant first to prevent cross-tenant enumeration
        const [user] = await this.db.select().from(users).where(
            and(
                eq(users.id, userId),
                this.tenantWhere(users.tenantId)
            )
        ).limit(1);

        if (!user) throw new Error('User not found or does not belong to this tenant');

        return this.db
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
    }
}
