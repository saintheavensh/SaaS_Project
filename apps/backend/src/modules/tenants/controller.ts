import { AppEnv } from '../../core/types/app-env.js';
import { Context } from 'hono';
import * as tenantService from './service.js';
import { CreateTenantSchema, UpdateTenantSchema, TenantIdParamSchema } from './schemas.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Get all tenants
 */
export const getTenants = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const tenants = await tenantService.getTenantsService();
        return successResponse(c, tenants, 'Tenants retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch tenants', message);
    }
};

/**
 * Get a specific tenant by ID
 */
export const getTenantById = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const { id: validatedId } = TenantIdParamSchema.parse({ id });

        const tenant = await tenantService.getTenantByIdService(validatedId);
        if (!tenant) {
            return errorResponse(c, 'Not Found', 'Tenant not found', 404);
        }

        return successResponse(c, tenant, 'Tenant retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch tenant', message);
    }
};

/**
 * Create a new tenant
 */
export const createTenant = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const body = await c.req.json();
        const validatedData = CreateTenantSchema.parse(body);

        const newTenant = await tenantService.createTenantService(validatedData);
        return successResponse(c, newTenant, 'Tenant created successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to create tenant', message, 400);
    }
};

/**
 * Update an existing tenant
 */
export const updateTenant = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const { id: validatedId } = TenantIdParamSchema.parse({ id });

        const body = await c.req.json();
        const validatedData = UpdateTenantSchema.parse(body);

        const updatedTenant = await tenantService.updateTenantService(validatedId, validatedData);
        return successResponse(c, updatedTenant, 'Tenant updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to update tenant', message, 400);
    }
};

/**
 * Delete a tenant
 */
export const deleteTenant = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const { id: validatedId } = TenantIdParamSchema.parse({ id });

        await tenantService.deleteTenantService(validatedId);
        return successResponse(c, null, 'Tenant deleted successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to delete tenant', message, 400);
    }
};
