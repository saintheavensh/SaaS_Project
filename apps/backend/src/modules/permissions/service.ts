import { eq, InferSelectModel } from 'drizzle-orm';
import { db } from '../../core/db.js';
import { permissions } from '@my-saas-app/db';
import { CreatePermissionInput, UpdatePermissionInput, PermissionResponse } from './schemas.js';

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
    const results = await db
        .select()
        .from(permissions);

    return results.map(mapToPermissionResponse);
};

/**
 * Get a single permission by ID
 */
export const getPermissionByIdService = async (id: string): Promise<PermissionResponse | null> => {
    const [result] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.id, id))
        .limit(1);

    if (!result) return null;
    return mapToPermissionResponse(result);
};

/**
 * Create a new global permission
 */
export const createPermissionService = async (input: CreatePermissionInput): Promise<PermissionResponse> => {
    // Check if name already exists
    const [existing] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.name, input.name))
        .limit(1);

    if (existing) {
        throw new Error(`Permission with name "${input.name}" already exists`);
    }

    const [newPermission] = await db
        .insert(permissions)
        .values({
            name: input.name,
            description: input.description ?? null,
        })
        .returning();

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

    const [updatedPermission] = await db
        .update(permissions)
        .set(updateData)
        .where(eq(permissions.id, id))
        .returning();

    return mapToPermissionResponse(updatedPermission);
};

/**
 * Delete a permission
 */
export const deletePermissionService = async (id: string): Promise<void> => {
    await db
        .delete(permissions)
        .where(eq(permissions.id, id));
};
