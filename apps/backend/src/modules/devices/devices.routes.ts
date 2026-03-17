import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { DevicesController } from './devices.controller.js';
import { DevicesRepository } from './devices.repository.js';
import { DevicesService } from './devices.service.js';
import { db } from '../../core/db.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';

const devicesRouter = new Hono<AppEnv>();

// Apply middleware
devicesRouter.use('*', authMiddleware);
devicesRouter.use('*', tenantContextMiddleware);

const getController = (c: any) => {
  const tenantId = c.get('tenantId');
  const repository = new DevicesRepository(db, tenantId);
  const service = new DevicesService(repository);
  return new DevicesController(service);
};

/**
 * Devices CRUD routes
 */
devicesRouter.get('/', (c) => getController(c).listDevices(c));
devicesRouter.get('/:id', (c) => getController(c).getDevice(c));
devicesRouter.post('/', (c) => getController(c).createDevice(c));
devicesRouter.put('/:id', (c) => getController(c).updateDevice(c));
devicesRouter.delete('/:id', (c) => getController(c).deleteDevice(c));

export { devicesRouter };
