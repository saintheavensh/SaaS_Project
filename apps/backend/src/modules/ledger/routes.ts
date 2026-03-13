import { Hono } from 'hono';
import { AppEnv } from '../../core/types/app-env.js';
import { authMiddleware } from '../../core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from '../../core/middlewares/tenantContextMiddleware.js';
import { LedgerController } from './controller/ledger.controller.js';

export const ledgerRouter = new Hono<AppEnv>();

const controller = new LedgerController();

// Apply middleware
ledgerRouter.use('*', authMiddleware, tenantContextMiddleware);

// Define endpoints
ledgerRouter.post('/move', controller.moveStock.bind(controller));
ledgerRouter.post('/opname/finalize', controller.finalizeOpname.bind(controller));
