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
import { productsRouter } from './modules/products/index.js';
import { ledgerRouter } from './modules/ledger/index.js';
import { catalogRouter, compatibilityRouter } from './modules/catalog/index.js';
import { supplierRouter } from './modules/suppliers/index.js';
import { categoryRouter } from './modules/categories/index.js';
import { productBrandRouter } from './modules/product-brands/index.js';
import { productTypesRouter } from './modules/product-types/index.js';
import { deviceBrandRouter } from './modules/device-brands/index.js';
import { devicesRouter } from './modules/devices/index.js';

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

// Products Module
router.route('/products', productsRouter);

// Ledger Module
router.route('/ledger', ledgerRouter);

// Catalog Module
router.route('/catalog', catalogRouter);
router.route('/compatibility', compatibilityRouter);

// Master Data Modules
router.route('/suppliers', supplierRouter);
router.route('/categories', categoryRouter);
router.route('/product-brands', productBrandRouter);
router.route('/product-types', productTypesRouter);
router.route('/device-brands', deviceBrandRouter);

// Devices Module
router.route('/devices', devicesRouter);

export default router;
