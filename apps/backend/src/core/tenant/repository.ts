import { eq, InferSelectModel } from 'drizzle-orm';
import { Database } from '../database/tenant-repository-base.js';
import { db } from '../db.js';
import { tenants } from '@my-saas-app/db';
import { CreateTenantInput, UpdateTenantInput } from './schemas.js';

type TenantTable = typeof tenants;

export class TenantRepository {
    private readonly db: Database;
    
    constructor() {
        this.db = db as unknown as Database;
    }

    async create(input: { name: string, slug: string }) {
        const [newTenant] = await this.db.insert(tenants).values({
            name: input.name,
            slug: input.slug,
        }).returning();
        return newTenant;
    }

    async findById(id: string) {
        const [tenant] = await this.db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
        return tenant;
    }

    async update(id: string, updateData: Partial<InferSelectModel<TenantTable>> & { updatedAt: Date }) {
        const [updatedTenant] = await this.db.update(tenants)
            .set(updateData)
            .where(eq(tenants.id, id))
            .returning();
        return updatedTenant;
    }

    async delete(id: string) {
        await this.db.delete(tenants).where(eq(tenants.id, id));
    }
}
