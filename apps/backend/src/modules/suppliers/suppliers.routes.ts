import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { SupplierController } from './suppliers.controller.js';
import { SupplierRepository } from './suppliers.repository.js';
import { SupplierService } from './suppliers.service.js';
import { db } from '../../core/db.js';

const supplierRouter = new Hono<AppEnv>();
const getController = (c: any) => {
  const tenantId = c.get('tenantId');
  const repository = new SupplierRepository(db, tenantId);
  const service = new SupplierService(repository);
  return new SupplierController(service);
};

/**
 * Supplier CRUD routes
 */
supplierRouter.get('/', (c) => getController(c).listSuppliers(c));
supplierRouter.get('/:id', (c) => getController(c).getSupplier(c));
supplierRouter.post('/', (c) => getController(c).createSupplier(c));
supplierRouter.patch('/:id', (c) => getController(c).updateSupplier(c));
supplierRouter.delete('/:id', (c) => getController(c).deleteSupplier(c));

export { supplierRouter };
