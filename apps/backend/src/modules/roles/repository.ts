import { eq, and, InferSelectModel } from 'drizzle-orm';
import { Database, TenantRepository as BaseTenantRepository } from '../../core/database/tenant-repository-base.js';
import { roles } from '@my-saas-app/db';

type RoleTable = typeof roles;

export class RoleRepository extends BaseTenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    async findAll() {
        return this.db.select().from(roles).where(this.tenantWhere(roles.tenantId));
    }

    async findById(id: string) {
        const [role] = await this.db.select().from(roles).where(
            and(
                this.tenantWhere(roles.tenantId),
                eq(roles.id, id)
            )
        ).limit(1);
        return role;
    }

    async findByName(name: string) {
        const [role] = await this.db.select().from(roles).where(
            and(
                this.tenantWhere(roles.tenantId),
                eq(roles.name, name)
            )
        ).limit(1);
        return role;
    }

    async create(name: string, description: string | null) {
        const [newRole] = await this.db.insert(roles).values({
            tenantId: this.tenantId,
            name,
            description,
        }).returning();
        return newRole;
    }

    async update(id: string, updateData: Partial<InferSelectModel<RoleTable>> & { updatedAt: Date }) {
        const [updatedRole] = await this.db.update(roles)
            .set(updateData)
            .where(
                and(
                    this.tenantWhere(roles.tenantId),
                    eq(roles.id, id)
                )
            )
            .returning();
        return updatedRole;
    }

    async delete(id: string) {
        await this.db.delete(roles).where(
            and(
                this.tenantWhere(roles.tenantId),
                eq(roles.id, id)
            )
        );
    }
}
