import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { ProductTypesController } from './product-types.controller.js';
import { ProductTypesRepository } from './product-types.repository.js';
import { ProductTypesService } from './product-types.service.js';
import { CategoryRepository } from '../categories/categories.repository.js';
import { db } from '../../core/db.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

const productTypesRouter = new Hono<AppEnv>();

// Apply middleware
productTypesRouter.use('*', authMiddleware);
productTypesRouter.use('*', tenantContextMiddleware);

const getController = (c: any) => {
  const tenantId = c.get('tenantId');
  const repository = new ProductTypesRepository(db, tenantId);
  const categoryRepository = new CategoryRepository(db, tenantId);
  const service = new ProductTypesService(repository, categoryRepository);
  return new ProductTypesController(service);
};

/**
 * Product Types CRUD routes
 */
productTypesRouter.get('/', (c) => getController(c).listProductTypes(c));
productTypesRouter.get('/:id', (c) => getController(c).getProductType(c));
productTypesRouter.get('/category/:categoryId', (c) => getController(c).getProductTypesByCategory(c));
productTypesRouter.post('/', (c) => getController(c).createProductType(c));
productTypesRouter.put('/:id', (c) => getController(c).updateProductType(c));
productTypesRouter.delete('/:id', (c) => getController(c).deleteProductType(c));

export { productTypesRouter };
