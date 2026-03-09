import { Hono } from 'hono';
import { authRouter } from './core/auth/routes.js';
import { tenantRouter } from './modules/tenants/routes.js';
import { userRouter } from './modules/users/routes.js';
import { roleRouter } from './modules/roles/routes.js';
import { permissionRouter } from './modules/permissions/routes.js';
import { rolePermissionRouter } from './modules/role-permissions/index.js';
import { userRoleRouter } from './modules/user-roles/index.js';
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
router.route('/users', userRoleRouter);

// Role Module
router.route('/roles', roleRouter);
router.route('/roles', rolePermissionRouter);

// Permission Module
router.route('/permissions', permissionRouter);

export default router;
