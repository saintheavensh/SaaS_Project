# Phase 1: Schema Integrity Foundation (Refactor Plan)

Refactoring the database schema to ensure strict tenant isolation, referential integrity, and domain-driven design.

## User Review Required

> [!WARNING]
> This refactor involves removing the `stock` column from the `products` table. The `stock_movements` and `batches` tables will now be the sole source of truth for stock levels. Application logic must be updated to aggregate stock from these tables.

> [!IMPORTANT]
> Consolidation of user-role logic: I am removing the `user_roles` junction table in favor of a single `role_id` on the `users` table to eliminate "split-brain" authorization logic, as most multi-tenant SaaS systems assign one primary role per tenant context.

## Proposed Changes

### Core & Auth
- [MODIFY] [auth.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/core/auth.ts): Remove `userRoles` table, ensure `rolePermissions` has `tenant_id`.
- [MODIFY] [tenants.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/core/tenants.ts): Minor hardening.

### Catalog
- [MODIFY] [products.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/catalog/products.ts): Remove `stock`, add `categoryId`, `productBrandId`, `productTypeId` with strict foreign keys.
- [MODIFY] [devices.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/catalog/devices.ts): Harden `brandId` and tenant checks.
- [NEW] [product_device_compatibility.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/catalog/product_device_compatibility.ts): Rename and harden.
- [DELETE] [productDeviceCompatibility.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/catalog/productDeviceCompatibility.ts)

### Inventory & Sales
- [MODIFY] [batches.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/inventory/batches.ts): Add `supplierId` foreign key.
- [MODIFY] [sales.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/inventory/sales.ts): Standardize naming and add missing tenant constraints.
- [NEW] [stock_movements.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/inventory/stock_movements.ts): Rename and harden.
- [DELETE] [stockMovements.ts](file:///C:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/packages/db/src/schema/inventory/stockMovements.ts)

## Verification Plan

### Automated Tests
- Run `npm run db:check` (if exists) or use Drizzle Kit to generate and verify migrations.
- Validate that all `tenant_id` columns are indexed and enforced.

### Manual Verification
- Review resulting SQL migrations for correctness and data safety.
