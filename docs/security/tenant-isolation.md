# Tenant Isolation Guidelines

## Why Tenant Filtering is Required
Our application is a multi-tenant SaaS backend, meaning multiple distinct organizations (tenants) share the same underlying database structure. To maintain strict data isolation and security, we must guarantee that a user from one tenant can **never** view, modify, or delete data belonging to another tenant.

If developers write direct `drizzle-orm` queries in services or controllers without appending a tenant filter, it leads to a **Critical Security Vulnerability** (Cross-Tenant Data Exposure). 

For example, performing a generic `await db.select().from(users)` returns all users across *all* tenants. We must enforce tenant boundaries at the database access layer.

## How to Use Tenant Repositories
To actively prevent cross-tenant queries, we use a **Repository Pattern** specifically designed to be "Tenant-Aware". All database access for tenant-specific data must occur through classes extending `TenantRepository`. 

The `TenantRepository` base class requires you to pass the `db` instance and the active `tenantId` (extracted safely from the request context middleware) during instantiation.

### Example: Creating a Safe Repository

```typescript
import { TenantRepository, Database } from '../../core/database/tenant-repository-base.js';
import { products } from '@my-saas-app/db';

export class ProductRepository extends TenantRepository {
    constructor(db: Database, tenantId: string) {
        super(db, tenantId);
    }

    async findAll() {
        return this.db
            .select()
            .from(products)
            // SAFELY forces the scope to the current tenant ID
            .where(this.tenantWhere(products.tenantId));
    }
}
```

### Example: Using a Safe Repository in a Service

```typescript
import { db } from '../../core/db.js';
import { ProductRepository } from './repository.js';

export const getProductsService = async (tenantId: string) => {
    // 1. Initialize the repository with the current tenant boundary
    const repository = new ProductRepository(db, tenantId);
    
    // 2. All subsequent queries are automatically protected
    return repository.findAll();
};
```

## Safe vs Unsafe Queries

**DO NOT DO THIS (UNSAFE):**
```typescript
// DANGEROUS: Missing tenant filter! Will expose all products to any user!
const allProducts = await db.select().from(products);

// DANGEROUS: Easy to forget adding `tenantId` in complex queries
const userProducts = await db
    .select()
    .from(products)
    .where(eq(products.userId, userId)); // Missing tenant boundary
```

**DO THIS (SAFE):**
```typescript
// SAFE: Tenant boundary enforced by TenantRepository instance
const repository = new ProductRepository(db, tenantId);
const tenantProducts = await repository.findAll();

// SAFE: Custom query safely scoped using inherited `this.tenantWhere` helper
async findByUser(userId: string) {
    return this.db
        .select()
        .from(products)
        .where(
            and(
                this.tenantWhere(products.tenantId), // Enforces tenant boundary
                eq(products.userId, userId)
            )
        );
}
```

By strictly adhering to the `TenantRepository` pattern, we systematically eliminate the risk of developers accidentally leaking data across tenants.
