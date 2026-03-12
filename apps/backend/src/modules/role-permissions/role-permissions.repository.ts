import { eq, and } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { db } from '../../core/db.js';
import { rolePermissions, permissions, roles } from '@my-saas-app/db';

export class RolePermissionsRepository extends TenantRepository {
    constructor(tenantId: string) {
        super(db as unknown as Database, tenantId);
    }

    private async verifyOwnership(roleId: string, permissionId: string) {
        // Verify role belongs to tenant
        const [role] = await this.db.select().from(roles).where(
            and(
                eq(roles.id, roleId),
                this.tenantWhere(roles.tenantId)
            )
        ).limit(1);

        if (!role) throw new Error('Role not found or does not belong to this tenant');

        // Verify permission exists (permissions are global, so no tenant verification is needed for the permission itself)
        const [permission] = await this.db.select().from(permissions).where(eq(permissions.id, permissionId)).limit(1);
        if (!permission) throw new Error('Permission not found');
    }

    async assignPermission(roleId: string, permissionId: string): Promise<void> {
        await this.verifyOwnership(roleId, permissionId);

        await this.db.insert(rolePermissions).values({
            roleId,
            permissionId,
        }).onConflictDoNothing();
    }

    async removePermission(roleId: string, permissionId: string): Promise<void> {
        await this.verifyOwnership(roleId, permissionId);

        await this.db.delete(rolePermissions).where(
            and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionId, permissionId)
            )
        );
    }

    async getPermissionsByRole(roleId: string) {
        // Ensure role belongs to tenant first
        const [role] = await this.db.select().from(roles).where(
            and(
                eq(roles.id, roleId),
                this.tenantWhere(roles.tenantId)
            )
        ).limit(1);

        if (!role) throw new Error('Role not found or does not belong to this tenant');

        return this.db
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
    }
}
