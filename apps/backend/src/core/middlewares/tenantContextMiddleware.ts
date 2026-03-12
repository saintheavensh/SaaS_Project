import { Context, Next } from 'hono';
import { errorResponse } from '../utils/response.js';
import { AppEnv } from '../types/app-env.js';

/**
 * Tenant context middleware - Validates tenant ID for isolation.
 *
 * SECURITY: Only trusts tenantId from the authenticated JWT context
 * (set by authMiddleware). Never falls back to user-controlled headers
 * or request body to prevent tenant impersonation attacks.
 */
export const tenantContextMiddleware = async (c: Context<AppEnv>, next: Next): Promise<void | Response> => {
    const tenantId = c.get('tenantId');

    if (!tenantId) {
        return errorResponse(c, 'Unauthorized', 'Tenant context missing. Authentication required.', 401);
    }

    await next();
};
