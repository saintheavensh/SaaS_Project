import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { tenants } from '@my-saas-app/db';
import { CreateTenantInput, UpdateTenantInput, TenantResponse } from './schemas.js';

/**
 * Create a new tenant
 */
export const createTenant = async (input: CreateTenantInput): Promise<TenantResponse> => {
    const [newTenant] = await db.insert(tenants).values({
        name: input.name,
        slug: input.domain?.split('.')[0] || `tenant-${Math.random().toString(36).substring(7)}`,
    }).returning();

    return {
        id: newTenant.id,
        name: newTenant.name,
        domain: null, // Logic for domain mapping can be added if needed
        createdAt: newTenant.createdAt.toISOString(),
        updatedAt: newTenant.updatedAt.toISOString(),
    };
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (id: string): Promise<TenantResponse | null> => {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);

    if (!tenant) return null;

    return {
        id: tenant.id,
        name: tenant.name,
        domain: null,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString(),
    };
};

/**
 * Update tenant
 */
export const updateTenant = async (id: string, input: UpdateTenantInput): Promise<TenantResponse> => {
    const [updatedTenant] = await db.update(tenants)
        .set({
            ...(input.name ? { name: input.name } : {}),
            updatedAt: new Date(),
        })
        .where(eq(tenants.id, id))
        .returning();

    if (!updatedTenant) {
        throw new Error('Tenant not found or update failed');
    }

    return {
        id: updatedTenant.id,
        name: updatedTenant.name,
        domain: null,
        createdAt: updatedTenant.createdAt.toISOString(),
        updatedAt: updatedTenant.updatedAt.toISOString(),
    };
};

/**
 * Delete tenant
 */
export const deleteTenant = async (id: string): Promise<void> => {
    await db.delete(tenants).where(eq(tenants.id, id));
};
