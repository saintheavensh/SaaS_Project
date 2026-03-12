import { CreateTenantInput, UpdateTenantInput, TenantResponse } from './schemas.js';
import { db } from '../db.js';
import { TenantRepository } from './repository.js';

const tenantRepo = new TenantRepository(db);

/**
 * Create a new tenant
 */
export const createTenant = async (input: CreateTenantInput): Promise<TenantResponse> => {
    const newTenant = await tenantRepo.create({
        name: input.name,
        slug: input.domain?.split('.')[0] || `tenant-${Math.random().toString(36).substring(7)}`,
    });

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
    const tenant = await tenantRepo.findById(id);

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
    const updatedTenant = await tenantRepo.update(id, {
        ...(input.name ? { name: input.name } : {}),
        updatedAt: new Date(),
    });

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
    await tenantRepo.delete(id);
};
