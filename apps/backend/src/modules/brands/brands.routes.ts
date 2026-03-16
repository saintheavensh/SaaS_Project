import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { BrandController } from './brands.controller.js';

const brandRouter = new Hono<AppEnv>();
const controller = new BrandController();

/**
 * Brand CRUD routes
 */
brandRouter.get('/', (c) => controller.listBrands(c));
brandRouter.get('/:id', (c) => controller.getBrand(c));
brandRouter.post('/', (c) => controller.createBrand(c));
brandRouter.put('/:id', (c) => controller.updateBrand(c));
brandRouter.delete('/:id', (c) => controller.deleteBrand(c));

export { brandRouter };
