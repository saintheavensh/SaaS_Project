import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { ProductBrandController } from './product-brands.controller.js';

const productBrandRouter = new Hono<AppEnv>();
const controller = new ProductBrandController();

/**
 * Brand CRUD routes
 */
productBrandRouter.get('/', (c) => controller.listBrands(c));
productBrandRouter.get('/:id', (c) => controller.getBrand(c));
productBrandRouter.post('/', (c) => controller.createBrand(c));
productBrandRouter.put('/:id', (c) => controller.updateBrand(c));
productBrandRouter.delete('/:id', (c) => controller.deleteBrand(c));

export { productBrandRouter };
