import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { SupplierController } from './suppliers.controller.js';

const supplierRouter = new Hono<AppEnv>();
const controller = new SupplierController();

/**
 * Supplier CRUD routes
 */
supplierRouter.get('/', (c) => controller.listSuppliers(c));
supplierRouter.get('/:id', (c) => controller.getSupplier(c));
supplierRouter.post('/', (c) => controller.createSupplier(c));
supplierRouter.patch('/:id', (c) => controller.updateSupplier(c));
supplierRouter.delete('/:id', (c) => controller.deleteSupplier(c));

export { supplierRouter };
