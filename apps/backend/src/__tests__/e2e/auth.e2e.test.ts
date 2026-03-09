import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { db, clearDb, seedTestData } from '../../core/utils/dbHelpers.js';
import { getHeaders } from '../../core/utils/testHelpers.js';
import { tenants, users } from '@my-saas-app/db';
import { eq } from 'drizzle-orm';

// We'll test against the raw fetch or a local URL if the server is running.
// For Hono, we can often just use supertest with the app instance.
// But the user specifically asked to run against a server started via `pnpm dev`.
// To keep it simple and portable in tests, we'll try to use the fetch property if exported,
// otherwise we use a fixed local URL.
const API_URL = 'http://localhost:4000/api/v1';

describe('Auth E2E Tests', () => {
    beforeAll(async () => {
        await clearDb();
    });

    afterAll(async () => {
        await clearDb();
    });

    it('SHOULD register a new tenant and user', async () => {
        const payload = {
            tenantName: 'New SaaS Company',
            tenantSlug: 'new-saas-' + Date.now(),
            email: 'admin@newsaas.com',
            password: 'securePassword123'
        };

        const res = await request(API_URL)
            .post('/auth/register')
            .set(getHeaders())
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.tenant).toBeDefined();

        // Verify DB state
        const dbTenant = await db.select().from(tenants).where(eq(tenants.slug, payload.tenantSlug));
        expect(dbTenant.length).toBe(1);

        const dbUser = await db.select().from(users).where(eq(users.email, payload.email));
        expect(dbUser.length).toBe(1);
    });

    it('SHOULD login with correct credentials and return JWT', async () => {
        // Seed test data
        const { tenantId } = await seedTestData();
        const loginPayload = {
            email: 'test@example.com',
            password: 'hashed_password' // Matching seedTestData for now
        };

        const res = await request(API_URL)
            .post('/auth/login')
            .set(getHeaders(undefined, tenantId))
            .send(loginPayload);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('SHOULD fail login with incorrect credentials', async () => {
        const loginPayload = {
            email: 'test@example.com',
            password: 'wrong_password'
        };

        const res = await request(API_URL)
            .post('/auth/login')
            .set(getHeaders())
            .send(loginPayload);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
