import { InferSelectModel } from 'drizzle-orm';
import { roles } from '@my-saas-app/db';
import { CreateRoleInput, UpdateRoleInput, RoleResponse } from './schemas.js';
import { RoleRepository } from './repository.js';

type RoleTable = typeof roles;

/**
 * Map database role model to RoleResponse
 */
const mapToRoleResponse = (role: InferSelectModel<RoleTable>): RoleResponse => ({
    id: role.id,
    tenantId: role.tenantId,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
});

/**
 * Get all roles for a tenant
 */
export const getRolesService = async (tenantId: string): Promise<RoleResponse[]> => {
    const roleRepo = new RoleRepository(tenantId);
    const results = await roleRepo.findAll();

    return results.map(mapToRoleResponse);
};

/**
 * Get a single role by ID and tenantId
 */
export const getRoleByIdService = async (tenantId: string, id: string): Promise<RoleResponse | null> => {
    const roleRepo = new RoleRepository(tenantId);
    const result = await roleRepo.findById(id);

    if (!result) return null;
    return mapToRoleResponse(result);
};

/**
 * Create a new role within a tenant
 */
export const createRoleService = async (tenantId: string, input: CreateRoleInput): Promise<RoleResponse> => {
    const roleRepo = new RoleRepository(tenantId);

    // Check for name uniqueness within the tenant
    const existing = await roleRepo.findByName(input.name);

    if (existing) {
        throw new Error(`Role with name "${input.name}" already exists for this tenant`);
    }

    const newRole = await roleRepo.create(input.name, input.description ?? null);

    return mapToRoleResponse(newRole);
};

/**
 * Update an existing role
 */
export const updateRoleService = async (
    tenantId: string,
    id: string,
    input: UpdateRoleInput
): Promise<RoleResponse> => {
    const roleRepo = new RoleRepository(tenantId);

    // Check if role exists and belongs to tenant
    const role = await roleRepo.findById(id);
    if (!role) {
        throw new Error('Role not found');
    }

    // If changing name, check uniqueness
    if (input.name && input.name !== role.name) {
        const existing = await roleRepo.findByName(input.name);

        if (existing) {
            throw new Error(`Role with name "${input.name}" already exists for this tenant`);
        }
    }

    // Clean up input for exactOptionalPropertyTypes
    const updateData: any = {
        updatedAt: new Date(),
    };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description ?? null;

    const updatedRole = await roleRepo.update(id, updateData);

    return mapToRoleResponse(updatedRole);
};

/**
 * Delete a role
 */
export const deleteRoleService = async (tenantId: string, id: string): Promise<void> => {
    const roleRepo = new RoleRepository(tenantId);
    await roleRepo.delete(id);

    // Some databases might not support rowCount on delete returning, 
    // but Drizzle with PG usually does. For now, we'll assume success if no error.
};
