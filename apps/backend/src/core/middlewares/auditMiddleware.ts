import { Context, Next } from 'hono';
import { logger } from '../utils/logger.js';
import { AppEnv } from '../types/app-env.js';

/**
 * Audit logging middleware skeleton
 */
export const auditMiddleware = async (c: Context<AppEnv>, next: Next): Promise<void> => {
    const start = Date.now();

    await next();

    const ms = Date.now() - start;
    logger.info(`${c.req.method} ${c.req.url} - ${ms}ms`);

    // TODO: implement persistent audit logging in DB for sensitive actions
};
