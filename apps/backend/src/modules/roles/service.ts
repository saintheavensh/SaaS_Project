import { eq, and, InferSelectModel } from 'drizzle-orm';
import { db } from '../../core/db.js';
import { roles } from '@my-saas-app/db';
import { CreateRoleInput, UpdateRoleInput, RoleResponse } from './schemas.js';

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
    const results = await db
        .select()
        .from(roles)
        .where(eq(roles.tenantId, tenantId));

    return results.map(mapToRoleResponse);
};

/**
 * Get a single role by ID and tenantId
 */
export const getRoleByIdService = async (tenantId: string, id: string): Promise<RoleResponse | null> => {
    const [result] = await db
        .select()
        .from(roles)
        .where(
            and(
                eq(roles.tenantId, tenantId),
                eq(roles.id, id)
            )
        )
        .limit(1);

    if (!result) return null;
    return mapToRoleResponse(result);
};

/**
 * Create a new role within a tenant
 */
export const createRoleService = async (tenantId: string, input: CreateRoleInput): Promise<RoleResponse> => {
    // Check for name uniqueness within the tenant
    const [existing] = await db
        .select()
        .from(roles)
        .where(
            and(
                eq(roles.tenantId, tenantId),
                eq(roles.name, input.name)
            )
        )
        .limit(1);

    if (existing) {
        throw new Error(`Role with name "${input.name}" already exists for this tenant`);
    }

    const [newRole] = await db
        .insert(roles)
        .values({
            tenantId,
            name: input.name,
            description: input.description ?? null,
        })
        .returning();

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
    // Check if role exists and belongs to tenant
    const role = await getRoleByIdService(tenantId, id);
    if (!role) {
        throw new Error('Role not found');
    }

    // If changing name, check uniqueness
    if (input.name && input.name !== role.name) {
        const [existing] = await db
            .select()
            .from(roles)
            .where(
                and(
                    eq(roles.tenantId, tenantId),
                    eq(roles.name, input.name)
                )
            )
            .limit(1);

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

    const [updatedRole] = await db
        .update(roles)
        .set(updateData)
        .where(
            and(
                eq(roles.tenantId, tenantId),
                eq(roles.id, id)
            )
        )
        .returning();

    return mapToRoleResponse(updatedRole);
};

/**
 * Delete a role
 */
export const deleteRoleService = async (tenantId: string, id: string): Promise<void> => {
    const result = await db
        .delete(roles)
        .where(
            and(
                eq(roles.tenantId, tenantId),
                eq(roles.id, id)
            )
        );

    // Some databases might not support rowCount on delete returning, 
    // but Drizzle with PG usually does. For now, we'll assume success if no error.
};
