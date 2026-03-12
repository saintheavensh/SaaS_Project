import { Context, Next } from 'hono';
import { errorResponse } from '../utils/response.js';
import { AppEnv } from '../types/app-env.js';

/**
 * Tenant context middleware - Extracts and validates tenant ID for isolation
 */
export const tenantContextMiddleware = async (c: Context<AppEnv>, next: Next): Promise<void | Response> => {
    // Accessing context set by authMiddleware
    const contextTenantId = c.get('tenantId');
    const headerTenantId = c.req.header('X-Tenant-ID');

    // Priority: 1. Auth context, 2. Request header
    const tenantId = contextTenantId || headerTenantId;

    if (!tenantId) {
        return errorResponse(c, 'Bad Request', 'Tenant context is required', 400);
    }

    // Set it for downstream use (controllers, services)
    c.set('tenantId', tenantId);

    await next();
};
