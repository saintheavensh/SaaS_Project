import { AppEnv } from '../../core/types/app-env.js';
import { Context } from 'hono';
import * as rolePermissionService from './service.js';
import { AssignPermissionToRoleSchema, RemovePermissionFromRoleSchema } from './schemas.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';
import { z } from 'zod';

/**
 * Handler for assigning a permission to a role
 */
export const assignPermissionHandler = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const roleId = c.req.param('roleId');
        const body = await c.req.json();

        const validated = AssignPermissionToRoleSchema.parse({
            roleId,
            permissionId: body.permissionId
        });

        await rolePermissionService.assignPermissionToRole(validated.roleId, validated.permissionId);
        return successResponse(c, null, 'Permission assigned to role successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to assign permission', message, 400);
    }
};

/**
 * Handler for removing a permission from a role
 */
export const removePermissionHandler = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const roleId = c.req.param('roleId');
        const permissionId = c.req.param('permissionId');

        const validated = RemovePermissionFromRoleSchema.parse({
            roleId,
            permissionId
        });

        await rolePermissionService.removePermissionFromRole(validated.roleId, validated.permissionId);
        return successResponse(c, null, 'Permission removed from role successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to remove permission', message, 400);
    }
};

/**
 * Handler for getting all permissions of a role
 */
export const getRolePermissionsHandler = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const roleId = c.req.param('roleId');
        const validatedRoleId = z.string().uuid().parse(roleId);

        const permissions = await rolePermissionService.getPermissionsByRole(validatedRoleId);
        return successResponse(c, permissions, 'Role permissions retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch role permissions', message, 400);
    }
};
