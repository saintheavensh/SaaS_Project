import { pgTable, uuid, varchar, text, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const permissions = pgTable('permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roles = pgTable('roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        tenantIdx: index('roles_tenant_idx').on(table.tenantId),
        nameTenantIdx: index('roles_name_tenant_idx').on(table.tenantId, table.name),
    };
});

export const rolePermissions = pgTable('role_permissions', {
    // ✅ FIX: tambahkan tenantId
    tenantId: uuid('tenant_id')
        .references(() => tenants.id)
        .notNull(),

    roleId: uuid('role_id')
        .references(() => roles.id)
        .notNull(),

    permissionId: uuid('permission_id')
        .references(() => permissions.id)
        .notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
        tenantIdx: index('role_permissions_tenant_idx').on(table.tenantId),
    };
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    passwordHash: text('password_hash').notNull(),
    roleId: uuid('role_id').references(() => roles.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        tenantIdx: index('users_tenant_idx').on(table.tenantId),
    };
});

export const userRoles = pgTable('user_roles', {
    userId: uuid('user_id').references(() => users.id).notNull(),
    roleId: uuid('role_id').references(() => roles.id).notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.roleId] }),
        userIdIdx: index('user_roles_user_idx').on(table.userId),
    };
});
