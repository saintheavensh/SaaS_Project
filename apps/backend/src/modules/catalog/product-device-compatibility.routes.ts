import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { ProductDeviceCompatibilityController } from './product-device-compatibility.controller.js';
import { ProductDeviceCompatibilityRepository } from './product-device-compatibility.repository.js';
import { ProductDeviceCompatibilityService } from './product-device-compatibility.service.js';
import { db } from '../../core/db.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

const compatibilityRouter = new Hono<AppEnv>();

// Apply middleware
compatibilityRouter.use('*', authMiddleware);
compatibilityRouter.use('*', tenantContextMiddleware);

const getController = (c: any) => {
  const tenantId = c.get('tenantId');
  const repository = new ProductDeviceCompatibilityRepository(db, tenantId);
  const service = new ProductDeviceCompatibilityService(repository);
  return new ProductDeviceCompatibilityController(service);
};

/**
 * Product-Device Compatibility CRUD routes
 */
compatibilityRouter.get('/', (c) => getController(c).listCompatibilities(c));
compatibilityRouter.get('/:id', (c) => getController(c).getCompatibility(c));
compatibilityRouter.post('/', (c) => getController(c).createCompatibility(c));
compatibilityRouter.put('/:id', (c) => getController(c).updateCompatibility(c));
compatibilityRouter.delete('/:id', (c) => getController(c).deleteCompatibility(c));

export { compatibilityRouter };
