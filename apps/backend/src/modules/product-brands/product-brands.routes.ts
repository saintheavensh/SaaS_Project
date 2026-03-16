import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { ProductBrandController } from './product-brands.controller.js';
import { ProductBrandRepository } from './product-brands.repository.js';
import { ProductBrandService } from './product-brands.service.js';
import { db } from '../../core/db.js';

const productBrandRouter = new Hono<AppEnv>();
const getController = (c: any) => {
  const tenantId = c.get('tenantId');
  const repository = new ProductBrandRepository(db, tenantId);
  const service = new ProductBrandService(repository);
  return new ProductBrandController(service);
};

/**
 * Brand CRUD routes
 */
productBrandRouter.get('/', (c) => getController(c).listBrands(c));
productBrandRouter.get('/:id', (c) => getController(c).getBrand(c));
productBrandRouter.post('/', (c) => getController(c).createBrand(c));
productBrandRouter.put('/:id', (c) => getController(c).updateBrand(c));
productBrandRouter.delete('/:id', (c) => getController(c).deleteBrand(c));

export { productBrandRouter };
