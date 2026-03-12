import { AppEnv } from '../types/app-env.js';
import { Context } from 'hono';

/**
 * Standardized JSON response structure
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

/**
 * Success response helper
 */
export const successResponse = <T>(c: Context<AppEnv>, data: T, message = 'Success', status: 200 | 201 = 200) => {
    return c.json<ApiResponse<T>>(
        {
            success: true,
            message,
            data,
        },
        status
    );
};

/**
 * Error response helper
 */
export const errorResponse = (c: Context<AppEnv>, message = 'Error', errors: unknown = null, status: 400 | 401 | 403 | 404 | 500 = 400) => {
    return c.json<ApiResponse>(
        {
            success: false,
            message,
            errors,
        },
        status
    );
};
