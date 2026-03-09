import { Hono } from 'hono';
import { authRouter } from './core/auth/routes.js';
import { tenantRouter } from './core/tenant/routes.js';
import { userRouter } from './modules/users/routes.js';
import { roleRouter } from './modules/roles/routes.js';
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

// User Module
router.route('/users', userRouter);

// Role Module
router.route('/roles', roleRouter);

export default router;
