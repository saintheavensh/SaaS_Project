import { initDb, tenants, users, roles } from '@my-saas-app/db';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

// Initialize DB with Supabase URL from environment
const db = initDb(process.env.DATABASE_URL!);

/**
 * Reset database state by clearing main tables
 */
export const clearDb = async (): Promise<void> => {
    try {
        // Delete in order to respect foreign key constraints
        await db.delete(users);
        await db.delete(tenants);
        await db.delete(roles);
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
};

/**
 * Seed minimal test data (tenant + user + role)
 */
export const seedTestData = async (): Promise<{ tenantId: string; userId: string }> => {
    // 1. Create a test tenant
    const [tenant] = await db.insert(tenants).values({
        name: 'Test Tenant',
        slug: 'test-tenant-' + Date.now(),
    }).returning();

    // 2. Create a test role scoped to the tenant
    const [role] = await db.insert(roles).values({
        tenantId: tenant.id,
        name: 'admin',
        description: 'Test Admin Role',
    }).onConflictDoUpdate({
        target: [roles.tenantId, roles.name],
        set: { updatedAt: new Date() }
    }).returning();

    // 3. Create a test user
    const [user] = await db.insert(users).values({
        tenantId: tenant.id,
        email: 'test@example.com',
        passwordHash: 'hashed_password', // In real tests, Hash this!
        roleId: role.id,
    }).returning();

    return { tenantId: tenant.id, userId: user.id };
};

export { db };
