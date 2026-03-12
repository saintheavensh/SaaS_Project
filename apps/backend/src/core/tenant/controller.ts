import { AppEnv } from '../types/app-env.js';
import { Context } from 'hono';
import * as tenantService from './service.js';
import { CreateTenantSchema, UpdateTenantSchema } from './schemas.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Handle tenant creation (Super Admin Only)
 */
export const create = async (c: Context<AppEnv>): Promise<Response> => {
    const role = c.get('role');
    if (role !== 'super-admin') {
        return errorResponse(c, 'Forbidden', 'Only super-admins can create tenants', 403);
    }

    try {
        const body = await c.req.json();
        const validatedData = CreateTenantSchema.parse(body);

        const result = await tenantService.createTenant(validatedData);

        return successResponse(c, result, 'Tenant created successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Creation failed', message, 400);
    }
};

/**
 * Handle getting a tenant (Ownership or Super Admin)
 */
export const getOne = async (c: Context<AppEnv>): Promise<Response> => {
    const id = c.req.param('id');
    const userTenantId = c.get('tenantId');
    const role = c.get('role');

    if (!id) return errorResponse(c, 'ID is required', null, 400);

    // Isolation Check: User can only access their own tenant unless they are super-admin
    if (id !== userTenantId && role !== 'super-admin') {
        return errorResponse(c, 'Forbidden', 'Access to another tenant is not allowed', 403);
    }

    const result = await tenantService.getTenantById(id);

    if (!result) {
        return errorResponse(c, 'Tenant not found', null, 404);
    }

    return successResponse(c, result, 'Tenant fetched successfully');
};

/**
 * Handle updating a tenant (Ownership or Super Admin)
 */
export const update = async (c: Context<AppEnv>): Promise<Response> => {
    const id = c.req.param('id');
    const userTenantId = c.get('tenantId');
    const role = c.get('role');

    if (!id) return errorResponse(c, 'ID is required', null, 400);

    // Isolation Check: User can only update their own tenant unless they are super-admin
    if (id !== userTenantId && role !== 'super-admin') {
        return errorResponse(c, 'Forbidden', 'Modification of another tenant is not allowed', 403);
    }

    try {
        const body = await c.req.json();
        const validatedData = UpdateTenantSchema.parse(body);

        const result = await tenantService.updateTenant(id, validatedData);

        return successResponse(c, result, 'Tenant updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Update failed', message, 400);
    }
};

/**
 * Handle deleting a tenant (Super Admin Only)
 */
export const remove = async (c: Context<AppEnv>): Promise<Response> => {
    const role = c.get('role');
    if (role !== 'super-admin') {
        return errorResponse(c, 'Forbidden', 'Only super-admins can delete tenants', 403);
    }

    const id = c.req.param('id');
    if (!id) return errorResponse(c, 'ID is required', null, 400);
    await tenantService.deleteTenant(id);

    return successResponse(c, null, 'Tenant deleted successfully');
};
