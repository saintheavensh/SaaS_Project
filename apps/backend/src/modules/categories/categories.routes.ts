import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { CategoryController } from './categories.controller.js';

const categoryRouter = new Hono<AppEnv>();
const controller = new CategoryController();

/**
 * Category CRUD routes
 */
categoryRouter.get('/', (c) => controller.listCategories(c));
categoryRouter.get('/:id', (c) => controller.getCategory(c));
categoryRouter.post('/', (c) => controller.createCategory(c));
categoryRouter.patch('/:id', (c) => controller.updateCategory(c));
categoryRouter.delete('/:id', (c) => controller.deleteCategory(c));

export { categoryRouter };
