import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { DeviceBrandController } from './device-brands.controller.js';
import { DeviceBrandRepository } from './device-brands.repository.js';
import { DeviceBrandService } from './device-brands.service.js';
import { db } from '../../core/db.js';

const deviceBrandRouter = new Hono<AppEnv>();
const getController = (c: any) => {
  const tenantId = c.get('tenantId');
  const repository = new DeviceBrandRepository(db, tenantId);
  const service = new DeviceBrandService(repository);
  return new DeviceBrandController(service);
};

/**
 * Device Brand CRUD routes
 */
deviceBrandRouter.get('/', (c) => getController(c).listDeviceBrands(c));
deviceBrandRouter.get('/:id', (c) => getController(c).getDeviceBrand(c));
deviceBrandRouter.post('/', (c) => getController(c).createDeviceBrand(c));
deviceBrandRouter.put('/:id', (c) => getController(c).updateDeviceBrand(c));
deviceBrandRouter.delete('/:id', (c) => getController(c).deleteDeviceBrand(c));

export { deviceBrandRouter };
