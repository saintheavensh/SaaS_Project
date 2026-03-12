import { InferSelectModel } from 'drizzle-orm';
import { tenants } from '@my-saas-app/db';
import { CreateTenantInput, UpdateTenantInput, TenantResponse } from './schemas.js';
import { TenantRepository } from '../../core/tenant/repository.js';

const tenantRepo = new TenantRepository();

type TenantTable = typeof tenants;

/**
 * Map database tenant model to TenantResponse
 */
const mapToTenantResponse = (tenant: InferSelectModel<TenantTable>): TenantResponse => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    description: tenant.description,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
});

/**
 * Get all tenants (usually restricted to super-admins)
 */
export const getTenantsService = async (): Promise<TenantResponse[]> => {
    const results = await tenantRepo.findAll();

    return results.map(mapToTenantResponse);
};

/**
 * Get a single tenant by ID
 */
export const getTenantByIdService = async (id: string): Promise<TenantResponse | null> => {
    const result = await tenantRepo.findById(id);

    if (!result) return null;
    return mapToTenantResponse(result);
};

/**
 * Create a new tenant
 */
export const createTenantService = async (input: CreateTenantInput): Promise<TenantResponse> => {
    // Check if name or slug already exists
    const existingSlug = await tenantRepo.findBySlug(input.slug);

    if (existingSlug) {
        throw new Error(`Tenant with slug "${input.slug}" already exists`);
    }

    const newTenant = await tenantRepo.create({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
    });

    return mapToTenantResponse(newTenant);
};

/**
 * Update an existing tenant
 */
export const updateTenantService = async (
    id: string,
    input: UpdateTenantInput
): Promise<TenantResponse> => {
    const tenant = await getTenantByIdService(id);
    if (!tenant) {
        throw new Error('Tenant not found');
    }

    // Clean up input for exactOptionalPropertyTypes
    const updateData: any = {
        updatedAt: new Date(),
    };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description ?? null;

    const updatedTenant = await tenantRepo.update(id, updateData);

    return mapToTenantResponse(updatedTenant);
};

/**
 * Delete a tenant
 */
export const deleteTenantService = async (id: string): Promise<void> => {
    await tenantRepo.delete(id);
};
