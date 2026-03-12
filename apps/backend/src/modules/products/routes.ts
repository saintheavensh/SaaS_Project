import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { ProductsController } from './controller.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

export const productsRouter = new Hono<AppEnv>();
const controller = new ProductsController();

// Apply middleware
productsRouter.use('*', authMiddleware);
productsRouter.use('*', tenantContextMiddleware);

productsRouter.post('/', (c) => controller.createProduct(c));
productsRouter.put('/:id', (c) => controller.updateProduct(c));
productsRouter.get('/:id', (c) => controller.getProduct(c));
