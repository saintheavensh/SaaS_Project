import { AppEnv } from '../../core/types/app-env.js';
import { Context } from 'hono';
import * as userService from './service.js';
import { CreateUserSchema, UpdateUserSchema, UserIdParamSchema } from './schemas.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';

/**
 * Get all users for the current tenant
 */
export const getUsers = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const users = await userService.getUsersService(tenantId);
        return successResponse(c, users, 'Users retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch users', message);
    }
};

/**
 * Get a specific user by ID
 */
export const getUserById = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');

        // Validate ID
        const { id: validatedId } = UserIdParamSchema.parse({ id });

        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const user = await userService.getUserByIdService(tenantId, validatedId);
        if (!user) {
            return errorResponse(c, 'Not Found', 'User not found', 404);
        }

        return successResponse(c, user, 'User retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch user', message);
    }
};

/**
 * Create a new user
 */
export const createUser = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const body = await c.req.json();
        const validatedData = CreateUserSchema.parse(body);

        const newUser = await userService.createUserService(tenantId, validatedData);
        return successResponse(c, newUser, 'User created successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to create user', message, 400);
    }
};

/**
 * Update user details
 */
export const updateUser = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');

        // Validate ID
        const { id: validatedId } = UserIdParamSchema.parse({ id });

        if (!tenantId) {
            return errorResponse(c, 'Unauthorized', 'Tenant ID not found in context', 401);
        }

        const body = await c.req.json();
        const validatedData = UpdateUserSchema.parse(body);

        const updatedUser = await userService.updateUserService(tenantId, validatedId, validatedData);
        return successResponse(c, updatedUser, 'User updated successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to update user', message, 400);
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (c: Context<AppEnv>): Promise<Response> => {
    try {
        const tenantId = c.get('tenantId');
        const userId = c.get('userId'); // Set by authMiddleware

        if (!tenantId || !userId) {
            return errorResponse(c, 'Unauthorized', 'Authenticated session not found', 401);
        }

        const profile = await userService.getProfileService(tenantId, userId);
        return successResponse(c, profile, 'Profile retrieved successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Failed to fetch profile', message);
    }
};
