import { eq, and, InferSelectModel } from 'drizzle-orm';
import { Database } from '../../core/database/tenant-repository-base.js';
import { db } from '../../core/db.js';
import { permissions, userRoles, roles, rolePermissions } from '@my-saas-app/db';
import { Permission } from '../../core/auth/permission.types.js';

type PermissionTable = typeof permissions;

/**
 * Global permissions repository. Does not use TenantRepository because
 * permissions are currently system-wide entities.
 */
export class PermissionRepository {
    private readonly db: Database;

    constructor() {
        this.db = db as unknown as Database;
    }

    async resolveUserPermissions(userId: string, tenantId: string): Promise<Permission[]> {
        const results = await this.db
            .selectDistinct({ name: permissions.name })
            .from(userRoles)
            .innerJoin(roles, and(
                eq(userRoles.roleId, roles.id),
                eq(roles.tenantId, tenantId)
            ))
            .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(eq(userRoles.userId, userId));

        return results.map(r => r.name as Permission);
    }

    async findAll() {
        return this.db.select().from(permissions);
    }

    async findById(id: string) {
        const [permission] = await this.db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
        return permission;
    }

    async findByName(name: string) {
        const [permission] = await this.db.select().from(permissions).where(eq(permissions.name, name)).limit(1);
        return permission;
    }

    async create(name: string, description: string | null) {
        const [newPermission] = await this.db.insert(permissions).values({
            name,
            description,
        }).returning();
        return newPermission;
    }

    async update(id: string, updateData: Partial<InferSelectModel<PermissionTable>> & { updatedAt: Date }) {
        const [updatedPermission] = await this.db.update(permissions)
            .set(updateData)
            .where(eq(permissions.id, id))
            .returning();
        return updatedPermission;
    }

    async delete(id: string) {
        await this.db.delete(permissions).where(eq(permissions.id, id));
    }
}
