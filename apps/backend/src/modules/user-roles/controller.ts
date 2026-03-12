import { AppEnv } from '../../core/types/app-env.js';
import { Context } from 'hono';
import * as userRoleService from './service.js';
import { AssignRoleToUserSchema, RemoveRoleFromUserSchema } from './schemas.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';
import { z } from 'zod';

/**
 * Handler for assigning a role to a user
 */
export const assignRoleHandler = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const userId = c.req.param('userId');
        const body = await c.req.json();

        const tenantId = c.get('tenantId');
        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID is missing from context', 401);
        }

        const validated = AssignRoleToUserSchema.parse({
            userId,
            roleId: body.roleId
        });

        await userRoleService.assignRoleToUser(tenantId, validated.userId, validated.roleId);
        return successResponse(c, null, 'Role assigned to user successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to assign role', message, 400);
    }
};

/**
 * Handler for removing a role from a user
 */
export const removeRoleHandler = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const userId = c.req.param('userId');
        const roleId = c.req.param('roleId');

        const tenantId = c.get('tenantId');
        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID is missing from context', 401);
        }

        const validated = RemoveRoleFromUserSchema.parse({
            userId,
            roleId
        });

        await userRoleService.removeRoleFromUser(tenantId, validated.userId, validated.roleId);
        return successResponse(c, null, 'Role removed from user successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to remove role', message, 400);
    }
};

/**
 * Handler for getting all roles of a user
 */
export const getUserRolesHandler = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const userId = c.req.param('userId');
        const tenantId = c.get('tenantId');
        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID is missing from context', 401);
        }

        const validatedUserId = z.string().uuid().parse(userId);

        const roles = await userRoleService.getRolesByUser(tenantId, validatedUserId);
        return successResponse(c, roles, 'User roles retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch user roles', message, 400);
    }
};
