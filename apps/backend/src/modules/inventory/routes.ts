import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { InventoryController } from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

export const inventoryRouter = new Hono<AppEnv>();
const controller = new InventoryController();

// Apply middleware to all inventory routes
inventoryRouter.use('*', authMiddleware);
inventoryRouter.use('*', tenantContextMiddleware);

inventoryRouter.post('/deduct', (c) => controller.deductStock(c));
inventoryRouter.post('/add', (c) => controller.addStock(c));
// inventoryRouter.post('/opname/finalize', (c) => controller.finalizeOpname(c));
