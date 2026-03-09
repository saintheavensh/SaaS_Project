import { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import * as authService from './service.js';
import { RegisterSchema, LoginSchema } from './schemas.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Handle user registration
 */
export const register = async (c: Context): Promise<Response> => {
    try {
        const body = await c.req.json();
        const validatedData = RegisterSchema.parse(body);

        const result = await authService.registerUser(validatedData);

        // Set Cookie
        setCookie(c, 'auth_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 3600, // 1 hour
            path: '/',
        });

        // Remove token from response for security
        const responseData = {
            user: result.user,
            refreshToken: result.refreshToken
        };

        return successResponse(c, responseData, 'User registered successfully', 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Registration failed', message, 400);
    }
};

/**
 * Handle user login
 */
export const login = async (c: Context): Promise<Response> => {
    try {
        const body = await c.req.json();
        const validatedData = LoginSchema.parse(body);

        const result = await authService.loginUser(validatedData);

        // Set Cookie
        setCookie(c, 'auth_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 3600, // 1 hour
            path: '/',
        });

        // Remove token from response for security
        const responseData = {
            user: result.user,
            refreshToken: result.refreshToken
        };

        return successResponse(c, responseData, 'Login successful', 200);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(c, 'Login failed', message, 401);
    }
};

/**
 * Handle user logout
 */
export const logout = async (c: Context): Promise<Response> => {
    deleteCookie(c, 'auth_token', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    });
    return successResponse(c, null, 'Logged out successfully');
};
