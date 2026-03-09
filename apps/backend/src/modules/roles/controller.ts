import { Context } from 'hono';
import * as roleService from './service.js';
import { CreateRoleSchema, UpdateRoleSchema, RoleIdParamSchema } from './schemas.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Get all roles for the current tenant
 */
export const getRoles = async (c: Context): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const roles = await roleService.getRolesService(tenantId);
        return successResponse(c, roles, 'Roles retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch roles', message);
    }
};

/**
 * Get a specific role by ID
 */
export const getRoleById = async (c: Context): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');

        // Validate ID via Zod
        const { id: validatedId } = RoleIdParamSchema.parse({ id });

        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const role = await roleService.getRoleByIdService(tenantId, validatedId);
        if (!role) {
            return errorResponse(c, 'Not Found', 'Role not found', 404);
        }

        return successResponse(c, role, 'Role retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch role', message);
    }
};

/**
 * Create a new role
 */
export const createRole = async (c: Context): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const body = await c.req.json();
        const validatedData = CreateRoleSchema.parse(body);

        const newRole = await roleService.createRoleService(tenantId, validatedData);
        return successResponse(c, newRole, 'Role created successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to create role', message, 400);
    }
};

/**
 * Update an existing role
 */
export const updateRole = async (c: Context): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');

        // Validate ID via Zod
        const { id: validatedId } = RoleIdParamSchema.parse({ id });

        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const body = await c.req.json();
        const validatedData = UpdateRoleSchema.parse(body);

        const updatedRole = await roleService.updateRoleService(tenantId, validatedId, validatedData);
        return successResponse(c, updatedRole, 'Role updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to update role', message, 400);
    }
};

/**
 * Delete a role
 */
export const deleteRole = async (c: Context): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');

        // Validate ID via Zod
        const { id: validatedId } = RoleIdParamSchema.parse({ id });

        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        await roleService.deleteRoleService(tenantId, validatedId);
        return successResponse(c, null, 'Role deleted successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to delete role', message, 400);
    }
};
