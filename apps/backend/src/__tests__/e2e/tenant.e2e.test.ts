import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { db, clearDb, seedTestData } from '../../core/utils/dbHelpers.js';
import { getHeaders, generateTestToken } from '../../core/utils/testHelpers.js';
import { tenants } from '@my-saas-app/db';
import { eq } from 'drizzle-orm';

const API_URL = 'http://localhost:4000/api/v1';

describe('Tenant E2E Tests', () => {
    let testToken: string;
    let testTenantId: string;

    beforeAll(async () => {
        await clearDb();
        const { userId, tenantId } = await seedTestData();
        testTenantId = tenantId;
        testToken = generateTestToken(userId, tenantId);
    });

    afterAll(async () => {
        await clearDb();
    });

    it('SHOULD get tenant list (protected)', async () => {
        const res = await request(API_URL)
            .get('/tenants')
            .set(getHeaders(testToken, testTenantId));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('SHOULD create a new tenant', async () => {
        const payload = {
            name: 'Secondary Tenant',
            slug: 'secondary-' + Date.now()
        };

        const res = await request(API_URL)
            .post('/tenants')
            .set(getHeaders(testToken, testTenantId))
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe(payload.name);

        // Verify DB
        const dbTenant = await db.select().from(tenants).where(eq(tenants.slug, payload.slug));
        expect(dbTenant.length).toBe(1);
    });

    it('SHOULD update a tenant', async () => {
        const updatePayload = {
            name: 'Updated Tenant Name'
        };

        const res = await request(API_URL)
            .patch(`/tenants/${testTenantId}`) // Using PATCH as defined in routes
            .set(getHeaders(testToken, testTenantId))
            .send(updatePayload);

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe(updatePayload.name);

        // Verify DB
        const [dbTenant] = await db.select().from(tenants).where(eq(tenants.id, testTenantId));
        expect(dbTenant.name).toBe(updatePayload.name);
    });

    it('SHOULD delete a tenant', async () => {
        // Create a temporary tenant to delete
        const [tempTenant] = await db.insert(tenants).values({
            name: 'To Be Deleted',
            slug: 'delete-me-' + Date.now()
        }).returning();

        const res = await request(API_URL)
            .delete(`/tenants/${tempTenant.id}`)
            .set(getHeaders(testToken, testTenantId));

        expect(res.status).toBe(200);

        // Verify DB
        const dbTenant = await db.select().from(tenants).where(eq(tenants.id, tempTenant.id));
        expect(dbTenant.length).toBe(0);
    });
});
