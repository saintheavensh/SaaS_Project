import { pgTable, uuid, varchar, timestamp, text, index, primaryKey, integer } from 'drizzle-orm/pg-core';

/**
 * Tenants table - Root of multi-tenancy
 */
export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const permissions = pgTable('permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Roles table - Scoped by tenant_id
 */
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
        // unique(table.tenantId, table.name) could also be used if drizzle version supports it well, 
        // but for now, we'll enforce unique logic in the service layer or via a unique index.
    };
});

/**
 * Role Permissions join table
 */
export const rolePermissions = pgTable('role_permissions', {
    roleId: uuid('role_id').references(() => roles.id).notNull(),
    permissionId: uuid('permission_id').references(() => permissions.id).notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
        roleIdx: index('role_permissions_role_idx').on(table.roleId),
        permissionIdx: index('role_permissions_permission_idx').on(table.permissionId),
    };
});

/**
 * User Roles join table
 */
export const userRoles = pgTable('user_roles', {
    userId: uuid('user_id').references(() => users.id).notNull(),
    roleId: uuid('role_id').references(() => roles.id).notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.roleId] }),
        userIdIdx: index('user_roles_user_idx').on(table.userId),
    };
});

/**
 * Users table - Scoped by tenant_id
 */
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

/**
 * Products table - Scoped by tenant_id
 */
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    stock: text('stock').default('0').notNull(), // Snapshot stock
    categoryId: uuid('category_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        tenantIdx: index('products_tenant_idx').on(table.tenantId),
        nameTenantIdx: index('products_name_tenant_idx').on(table.tenantId, table.name),
    };
});

/**
 * Product Batches table - Scoped by tenant_id
 */
export const batches = pgTable('batches', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    buyPrice: text('buy_price').notNull(),
    sellPrice: text('sell_price').notNull(),
    initialStock: text('initial_stock').notNull(),
    currentStock: text('current_stock').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        tenantIdx: index('batches_tenant_idx').on(table.tenantId),
        productTenantIdx: index('batches_product_tenant_idx').on(table.tenantId, table.productId),
    };
});

/**
 * Stock Movements table - Append-only ledger scoped by tenant_id
 */
export const stockMovements = pgTable('stock_movements', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    batchId: uuid('batch_id').references(() => batches.id).notNull(),
    movementType: text('movement_type').notNull(), // e.g., PURCHASE, SALE, ADJUSTMENT, OPNAME
    delta: integer('delta').notNull(), // positive = added, negative = removed
    referenceId: uuid('reference_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        tenantIdx: index('stock_movements_tenant_idx').on(table.tenantId),
        productIdx: index('stock_movements_product_idx').on(table.productId),
        batchIdx: index('stock_movements_batch_idx').on(table.batchId),
        createdAtIdx: index('stock_movements_created_at_idx').on(table.createdAt),
    };
});
