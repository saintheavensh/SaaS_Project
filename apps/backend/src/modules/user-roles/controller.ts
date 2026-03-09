import { Context } from 'hono';
import * as userRoleService from './service.js';
import { AssignRoleToUserSchema, RemoveRoleFromUserSchema } from './schemas.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';
import { z } from 'zod';

/**
 * Handler for assigning a role to a user
 */
export const assignRoleHandler = async (c: Context): Promise<Response> => {
    try {
        const userId = c.req.param('userId');
        const body = await c.req.json();

        const validated = AssignRoleToUserSchema.parse({
            userId,
            roleId: body.roleId
        });

        await userRoleService.assignRoleToUser(validated.userId, validated.roleId);
        return successResponse(c, null, 'Role assigned to user successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to assign role', message, 400);
    }
};

/**
 * Handler for removing a role from a user
 */
export const removeRoleHandler = async (c: Context): Promise<Response> => {
    try {
        const userId = c.req.param('userId');
        const roleId = c.req.param('roleId');

        const validated = RemoveRoleFromUserSchema.parse({
            userId,
            roleId
        });

        await userRoleService.removeRoleFromUser(validated.userId, validated.roleId);
        return successResponse(c, null, 'Role removed from user successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to remove role', message, 400);
    }
};

/**
 * Handler for getting all roles of a user
 */
export const getUserRolesHandler = async (c: Context): Promise<Response> => {
    try {
        const userId = c.req.param('userId');
        const validatedUserId = z.string().uuid().parse(userId);

        const roles = await userRoleService.getRolesByUser(validatedUserId);
        return successResponse(c, roles, 'User roles retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch user roles', message, 400);
    }
};
