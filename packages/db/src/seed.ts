import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import { eq } from 'drizzle-orm';

import * as dotenv from 'dotenv';
dotenv.config({ path: '../../apps/backend/.env' });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

async function seed() {
    console.log('🌱 Seeding database...');

    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    try {
        // 1. Tenants
        await db.insert(schema.tenants).values({ name: 'System', slug: 'system' }).onConflictDoNothing();
        await db.insert(schema.tenants).values({ name: 'Tenant 1', slug: 't1' }).onConflictDoNothing();
        console.log('✅ Tenants initialized');

        // Fetch System Tenant
        const [systemTenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, 'system')).limit(1);

        // 2. Roles (Associated with System Tenant)
        const roleNames = ['super-admin', 'admin', 'user'];
        for (const name of roleNames) {
            await db.insert(schema.roles).values({
                name,
                tenantId: systemTenant.id,
                description: `Default system ${name} role`
            }).onConflictDoNothing();
        }
        console.log('✅ Roles initialized');

        // 3. Permissions (Global)
        const permissionNames = [
            // Core System Permissions (Module: user, role, permission)
            'user.read', 'user.create', 'user.update', 'user.delete',
            'role.read', 'role.create', 'role.update', 'role.delete',
            'permission.read', 'permission.create', 'permission.update', 'permission.delete',
            
            // Tenant Permissions
            'tenant.read', 'tenant.create', 'tenant.update', 'tenant.delete'
        ];
        for (const name of permissionNames) {
            await db.insert(schema.permissions).values({
                name,
                description: `Global permission to ${name.replace('.', ' ')}`
            }).onConflictDoNothing();
        }
        console.log('✅ Permissions initialized');

        // Fetch IDs and all permissions
        const [superAdminRole] = await db.select().from(schema.roles).where(eq(schema.roles.name, 'super-admin')).limit(1);
        const [adminRole] = await db.select().from(schema.roles).where(eq(schema.roles.name, 'admin')).limit(1);
        const [userRole] = await db.select().from(schema.roles).where(eq(schema.roles.name, 'user')).limit(1);
        const [tenantT1] = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, 't1')).limit(1);
        
        const allPermissions = await db.select().from(schema.permissions);

        // 4. Role Permissions Mapping
        // Super Admin gets all
        for (const p of allPermissions) {
            await db.insert(schema.rolePermissions).values({
                roleId: superAdminRole.id,
                permissionId: p.id
            }).onConflictDoNothing();
        }

        // Admin gets most (exclude tenant deletion and permission deletion to prevent lockout)
        const adminExclusions = ['tenant.delete', 'permission.delete'];
        for (const p of allPermissions) {
            if (!adminExclusions.includes(p.name)) {
                await db.insert(schema.rolePermissions).values({
                    roleId: adminRole.id,
                    permissionId: p.id
                }).onConflictDoNothing();
            }
        }

        // User gets read-only
        const readOnlyPermissions = allPermissions.filter(p => p.name.endsWith('.read'));
        for (const p of readOnlyPermissions) {
            await db.insert(schema.rolePermissions).values({
                roleId: userRole.id,
                permissionId: p.id
            }).onConflictDoNothing();
        }
        console.log('✅ Role Permissions initialized');

        const hashedPw = '$2b$10$dfKhozMHc80A7bF9drmUxOuZbOUYNw2VAuSpmGW6c15D24tU3Jyau';

        // 5. Super Admin User
        await db.insert(schema.users).values({
            tenantId: systemTenant.id,
            email: 'admin@example.com',
            name: 'System Admin',
            passwordHash: hashedPw,
            roleId: superAdminRole.id,
        }).onConflictDoUpdate({
            target: schema.users.email,
            set: { passwordHash: hashedPw, name: 'System Admin' }
        });
        console.log('✅ Super Admin user initialized');

        // 6. Regular User
        await db.insert(schema.users).values({
            tenantId: tenantT1.id,
            email: 'user@example.com',
            name: 'Regular User',
            passwordHash: hashedPw,
            roleId: userRole.id,
        }).onConflictDoUpdate({
            target: schema.users.email,
            set: { passwordHash: hashedPw, name: 'Regular User' }
        });
        console.log('✅ Regular User initialized');

        // 7. Populate user_roles (RBAC Join Table)
        const [superAdminUser] = await db.select().from(schema.users).where(eq(schema.users.email, 'admin@example.com')).limit(1);
        const [regularUser] = await db.select().from(schema.users).where(eq(schema.users.email, 'user@example.com')).limit(1);

        if (superAdminUser) {
            await db.insert(schema.userRoles).values({
                userId: superAdminUser.id,
                roleId: superAdminRole.id
            }).onConflictDoNothing();
        }

        if (regularUser) {
            await db.insert(schema.userRoles).values({
                userId: regularUser.id,
                roleId: userRole.id
            }).onConflictDoNothing();
        }
        console.log('✅ User Roles initialized');

        console.log('✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await client.end();
    }
}

seed();
