import { pgTable, uuid, varchar, text, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { timestamps } from './timestamps';

export const permissions = pgTable('permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    description: text('description'),
    ...timestamps(),
});

export const roles = pgTable('roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('roles_tenant_idx').on(table.tenantId),
    };
});

export const rolePermissions = pgTable('role_permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
        .references(() => tenants.id)
        .notNull(),
    roleId: uuid('role_id')
        .references(() => roles.id)
        .notNull(),
    permissionId: uuid('permission_id')
        .references(() => permissions.id)
        .notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantIdx: index('role_permissions_tenant_idx').on(table.tenantId),
    };
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }),
    passwordHash: text('password_hash').notNull(),
    roleId: uuid('role_id').references(() => roles.id).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        tenantEmailIdx: index('users_tenant_email_idx').on(table.tenantId, table.email),
    };
});

export const userRoles = pgTable('user_roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    roleId: uuid('role_id').references(() => roles.id).notNull(),
    ...timestamps(),
}, (table) => {
    return {
        userIdIdx: index('user_roles_user_idx').on(table.userId),
    };
});
