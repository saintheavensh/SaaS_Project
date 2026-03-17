# SCHEMA AUDIT REPORT: Multi-Tenant Inventory System

---

# 1. EXECUTIVE SUMMARY

* **Overall schema health**: 4/10
* **Critical issues**:
    - **Leaking Multi-tenancy**: Junction tables (`role_permissions`, `user_roles`) lack `tenant_id`, creating cross-tenant security risks.
    - **Referential Integrity Gaps**: Missing foreign keys for `categoryId`, `supplierId`, `productBrandId`, and `productTypeId`.
    - **Dual Source of Truth**: `products.stock` snapshot column creates risk of "Ghost Stock" drift relative to the ledger (`stock_movements`).
    - **Inconsistent Domain Naming**: Mixed camelCase and snake_case in file naming and column definitions.
* **Risk level**: **HIGH**

---

# 2. DETAILED FINDINGS

### A. Tenant Isolation Failure in Junctions
- **Problem**: `role_permissions` and `user_roles` do not have a `tenant_id` column.
- **Danger**: A query error or malicious actor could potentially associate permissions or roles across tenants if the join isn't strictly scoped by `tenant_id`.
- **Impact**: Violation of strict multi-tenant isolation principles.

### B. Missing Domain Identity in Catalog
- **Problem**: `products` table lacks `product_brand_id` and `product_type_id`. `categoryId` is a naked UUID without a foreign key.
- **Danger**: Inconsistent catalog data. One tenant might have "Nike" as a brand and "Footwear" as a category, but without FKs, records can become orphaned if a master data record is deleted.
- **Impact**: Poor data quality and broken relationships in the inventory UI.

### C. The "Ghost Stock" Snapshot Drift
- **Problem**: `products.stock` is an integer snapshot. Total stock should be derived from `batches` or `stock_movements`.
- **Danger**: If an update to `stock_movements` succeeds but the product stock increment fails, the system reports incorrect inventory.
- **Impact**: Financial and inventory traceability loss. In a FIFO system, snapshots are dangerous.

### D. Naming & Case Consistency
- **Problem**: Files like [productDeviceCompatibility.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/catalog/productDeviceCompatibility.ts) and [stockMovements.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/inventory/stockMovements.ts) use camelCase while others use snake_case.
- **Danger**: Import errors on Linux-based production/CI environments.
- **Impact**: Deployment instability.

---

# 3. SCHEMA REFACTOR PLAN

### A. Foreign Key Fixes
- **Refactor**: Link `products.category_id` -> `categories.id`.
- **Refactor**: Link `products.product_brand_id` -> `product_brands.id`.
- **Refactor**: Link `products.product_type_id` -> `product_types.id`.
- **Refactor**: Link `batches.supplier_id` -> `suppliers.id`.

### B. Tenant Integrity Fixes
- **Refactor**: Add `tenant_id` to `role_permissions`.
- **Refactor**: Remove `user_roles` (consolidate to `users.role_id`).
- **Refactor**: Ensure all `tenant_id` indexes are consistent.

### C. Naming Standardization
- **Refactor**: Rename all files to `snake_case.ts`.
- **Refactor**: Standardize column names (e.g., `device_brand_id` in `devices`).

### D. Structural Changes
- **Refactor**: [DELETE] `products.stock` column.
- **Refactor**: Introduce `supplier_id` in `batches` for FIFO traceability.

---

# 4. FINAL REFACTORED SCHEMA

### Core & Auth (auth.ts)
```typescript
export const roles = pgTable('roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    description: text('description'),
    ...timestamps(), // Standardized
}, (table) => ({
    tenantIdx: index('roles_tenant_idx').on(table.tenantId),
    nameTenantIdx: index('roles_name_tenant_idx').on(table.tenantId, table.name),
}));

export const rolePermissions = pgTable('role_permissions', {
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(), // Added
    roleId: uuid('role_id').references(() => roles.id).notNull(),
    permissionId: uuid('permission_id').references(() => permissions.id).notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
    tenantIdx: index('role_permissions_tenant_idx').on(table.tenantId),
}));

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    passwordHash: text('password_hash').notNull(),
    roleId: uuid('role_id').references(() => roles.id).notNull(), // Source of truth
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('users_tenant_idx').on(table.tenantId),
}));
// userRoles junction table removed
```

### Catalog (products.ts)
```typescript
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    categoryId: uuid('category_id').references(() => categories.id).notNull(), // Fixed FK
    brandId: uuid('product_brand_id').references(() => productBrands.id).notNull(), // Added
    typeId: uuid('product_type_id').references(() => productTypes.id).notNull(), // Added
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('products_tenant_idx').on(table.tenantId),
    nameTenantIdx: index('products_name_tenant_idx').on(table.tenantId, table.name),
    categoryIdx: index('products_category_idx').on(table.categoryId),
}));
// stock column removed
```

### Inventory (batches.ts)
```typescript
export const batches = pgTable('batches', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(), // Added procurement FK
    buyPrice: numeric('buy_price').notNull(),
    sellPrice: numeric('sell_price').notNull(),
    initialStock: integer('initial_stock').notNull(),
    currentStock: integer('current_stock').notNull(),
    ...timestamps(),
}, (table) => ({
    tenantIdx: index('batches_tenant_idx').on(table.tenantId),
    productIdx: index('batches_product_idx').on(table.productId),
    supplierIdx: index('batches_supplier_idx').on(table.supplierId),
}));
```

---

# 5. CHANGELOG

- `refactor(schema)!: remove products.stock to promote stock_movements as SOT`
- `refactor(schema): add FK constraints to products (category, brand, type)`
- `refactor(schema): add tenant_id to role_permissions for strict isolation`
- `refactor(schema): consolidate user auth to single role_id on users table`
- `refactor(schema): add supplier_id to batches for procurement tracking`
- `fix(schema): rename files to snake_case for CI compatibility`

---

# 6. ENGINEERING RATIONALE

- **Why tenant isolation matters**: In a SaaS environment, data leakage is a business-ending event. Explicit `tenant_id` on every table (including junctions) allows for Database-level Row Level Security (RLS) and predictable application-level filtering.
- **Why FK enforcement is critical**: In a retail/POS context, orphaned records lead to broken reports and crashes. FKs ensure that if a supplier is deleted, its batches are either handled or the deletion is blocked.
- **Why removing stock column**: Calculated fields should either be materialized views or aggregated on the fly. Snapshot columns are a legacy of monolithic systems and have no place in a high-integrity ledger system.

---

# 7. RISK & MIGRATION NOTES

- **Breaking Changes**: Application code reading `products.stock` will break. A new utility function `getProductStock(productId)` must be introduced.
- **Auth Updates**: Existing multi-role users (if any) will need migration to a single primary role.
- **Naming**: Import paths in the backend will need to be updated due to filename changes.
