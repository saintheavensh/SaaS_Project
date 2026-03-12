import { Hono } from 'hono';
import { AppEnv } from './core/types/app-env.js';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from 'hono/adapter';
import 'dotenv/config';
import router from './routes.js';

import { auditMiddleware } from './core/middlewares/auditMiddleware.js';
import { authMiddleware } from './core/middlewares/authMiddleware.js';
import { tenantContextMiddleware } from './core/middlewares/tenantContextMiddleware.js';

const app = new Hono<AppEnv>();

// Middleware
app.use('*', logger());
app.use(
    '*',
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
        exposeHeaders: ['Content-Length', 'Set-Cookie'],
        credentials: true,
    })
);
app.use('*', auditMiddleware);

// Base Route
app.get('/', (c) => {
    return c.json({
        message: 'SaaS Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

// Routes Registration
app.route('/api/v1', router);

// Swagger Documentation Setup (Placeholder)
// In a real implementation, we would use swagger-jsdoc and swagger-ui-express here.
// Since this is Hono, we might use @hono/zod-openapi or similar for better DX.

import { serve } from '@hono/node-server';

const port = Number(process.env.PORT) || 4000;

console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});

export default app;
