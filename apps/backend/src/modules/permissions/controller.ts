import { Context } from 'hono';
import * as permissionService from './service.js';
import { CreatePermissionSchema, UpdatePermissionSchema, PermissionIdParamSchema } from './schemas.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Handle listing all permissions
 */
export const getPermissionsHandler = async (c: Context): Promise<Response> => {
    try {
        const permissions = await permissionService.getPermissionsService();
        return successResponse(c, permissions, 'Permissions retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch permissions', message);
    }
};

/**
 * Handle getting a specific permission by ID
 */
export const getPermissionHandler = async (c: Context): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const { id: validatedId } = PermissionIdParamSchema.parse({ id });

        const permission = await permissionService.getPermissionByIdService(validatedId);
        if (!permission) {
            return errorResponse(c, 'Not Found', 'Permission not found', 404);
        }

        return successResponse(c, permission, 'Permission retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch permission', message);
    }
};

/**
 * Handle creating a new permission
 */
export const createPermissionHandler = async (c: Context): Promise<Response> => {
    try {
        const body = await c.req.json();
        const validatedData = CreatePermissionSchema.parse(body);

        const newPermission = await permissionService.createPermissionService(validatedData);
        return successResponse(c, newPermission, 'Permission created successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to create permission', message, 400);
    }
};

/**
 * Handle updating an existing permission
 */
export const updatePermissionHandler = async (c: Context): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const { id: validatedId } = PermissionIdParamSchema.parse({ id });

        const body = await c.req.json();
        const validatedData = UpdatePermissionSchema.parse(body);

        const updatedPermission = await permissionService.updatePermissionService(validatedId, validatedData);
        return successResponse(c, updatedPermission, 'Permission updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to update permission', message, 400);
    }
};

/**
 * Handle deleting a permission
 */
export const deletePermissionHandler = async (c: Context): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const { id: validatedId } = PermissionIdParamSchema.parse({ id });

        await permissionService.deletePermissionService(validatedId);
        return successResponse(c, null, 'Permission deleted successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to delete permission', message, 400);
    }
};
