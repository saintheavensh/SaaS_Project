import { InferSelectModel } from 'drizzle-orm';
import { permissions } from '@my-saas-app/db';
import { CreatePermissionInput, UpdatePermissionInput, PermissionResponse } from './schemas.js';
import { PermissionRepository } from './repository.js';

const permissionRepo = new PermissionRepository();

type PermissionTable = typeof permissions;

/**
 * Map database permission model to PermissionResponse
 */
const mapToPermissionResponse = (permission: InferSelectModel<PermissionTable>): PermissionResponse => ({
    id: permission.id,
    name: permission.name,
    description: permission.description,
    createdAt: permission.createdAt.toISOString(),
    updatedAt: permission.updatedAt.toISOString(),
});

/**
 * Get all global permissions
 */
export const getPermissionsService = async (): Promise<PermissionResponse[]> => {
    const results = await permissionRepo.findAll();

    return results.map(mapToPermissionResponse);
};

/**
 * Get a single permission by ID
 */
export const getPermissionByIdService = async (id: string): Promise<PermissionResponse | null> => {
    const result = await permissionRepo.findById(id);

    if (!result) return null;
    return mapToPermissionResponse(result);
};

/**
 * Create a new global permission
 */
export const createPermissionService = async (input: CreatePermissionInput): Promise<PermissionResponse> => {
    // Check if name already exists
    const existing = await permissionRepo.findByName(input.name);

    if (existing) {
        throw new Error(`Permission with name "${input.name}" already exists`);
    }

    const newPermission = await permissionRepo.create(input.name, input.description ?? null);

    return mapToPermissionResponse(newPermission);
};

/**
 * Update an existing permission
 */
export const updatePermissionService = async (
    id: string,
    input: UpdatePermissionInput
): Promise<PermissionResponse> => {
    const permission = await getPermissionByIdService(id);
    if (!permission) {
        throw new Error('Permission not found');
    }

    // Clean up input for exactOptionalPropertyTypes
    const updateData: any = {
        updatedAt: new Date(),
    };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description ?? null;

    const updatedPermission = await permissionRepo.update(id, updateData);

    return mapToPermissionResponse(updatedPermission);
};

/**
 * Delete a permission
 */
export const deletePermissionService = async (id: string): Promise<void> => {
    await permissionRepo.delete(id);
};
