import { Hono } from 'hono';
import { authRouter } from './core/auth/routes.js';
import { tenantRouter } from './core/tenant/routes.js';
import { authMiddleware } from './core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from './core/middlewares/tenantContextMiddleware.js';

const router = new Hono();

// Auth Module (Public)
router.route('/auth', authRouter);

// Protected Modules
router.use('/tenants/*', authMiddleware);
router.use('/tenants/*', tenantContextMiddleware);

// Tenant Module
router.route('/tenants', tenantRouter);

export default router;
