import { Hono } from 'hono';
import { AppEnv } from './core/types/app-env.js';
import { authRouter } from './core/auth/routes.js';
import { tenantRouter } from './modules/tenants/routes.js';
import { userRouter } from './modules/users/routes.js';
import { roleRouter } from './modules/roles/routes.js';
import { permissionRouter } from './modules/permissions/routes.js';
import { rolePermissionRouter } from './modules/role-permissions/index.js';
import { userRoleRouter } from './modules/user-roles/index.js';
import { inventoryRouter } from './modules/inventory/index.js';


const router = new Hono<AppEnv>();

// Auth Module (Public)
router.route('/auth', authRouter);

// Tenant Module (auth + tenant context applied at module level)
router.route('/tenants', tenantRouter);

// User Module
router.route('/users', userRouter);
router.route('/users', userRoleRouter);

// Role Module
router.route('/roles', roleRouter);
router.route('/roles', rolePermissionRouter);

// Permission Module
router.route('/permissions', permissionRouter);

// Inventory Module
router.route('/inventory', inventoryRouter);

export default router;
