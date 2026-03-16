import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { CategoryController } from './categories.controller.js';
import { CategoryRepository } from './categories.repository.js';
import { CategoryService } from './categories.service.js';
import { db } from '../../core/db.js';

const categoryRouter = new Hono<AppEnv>();
const getController = (c: any) => {
  const tenantId = c.get('tenantId');
  const repository = new CategoryRepository(db, tenantId);
  const service = new CategoryService(repository);
  return new CategoryController(service);
};

/**
 * Category CRUD routes
 */
categoryRouter.get('/', (c) => getController(c).listCategories(c));
categoryRouter.get('/:id', (c) => getController(c).getCategory(c));
categoryRouter.post('/', (c) => getController(c).createCategory(c));
categoryRouter.patch('/:id', (c) => getController(c).updateCategory(c));
categoryRouter.delete('/:id', (c) => getController(c).deleteCategory(c));

export { categoryRouter };
