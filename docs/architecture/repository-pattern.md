# Repository Pattern Architecture

To guarantee strict tenant isolation and security, this backend enforces a strict **Controller → Service → Repository** architectural pattern.

## Core Rules

1. **Repository-Only Database Access**: All database access (**MUST**) go through a repository.
2. **Tenant Isolation Encapsulation**: All tenant-specific tables (**MUST**) use the `TenantRepository` base class to enforce automatic `tenantId` filtering.
3. **No Service DB Imports**: Services (**CANNOT**) import `db` or `drizzle-orm` directly. They may only instantiate and call repositories.

## Implementation Guidelines

### 1. Controllers
- Process HTTP requests, extract parameters, and handle Zod validation.
- Extract `tenantId` from the context (`c.get('tenantId')`) and pass it down to services.
- Return standard `successResponse` or `errorResponse`.

### 2. Services
- Contain business logic and orchestration.
- Retrieve data exclusively by instantiating the relevant Repository.
- e.g. `const repo = new UsersRepository(tenantId); await repo.findById(id);`

### 3. Repositories
- Encapsulate all raw `drizzle-orm` queries and database mutations.
- Import `db` internally and pass it to the base `TenantRepository`.
- Secure Pivot operations (like `user_roles`) must explicitly `verifyOwnership` to guarantee that both IDs in the pivot map to entities owned by the current `tenantId` before performing `INSERT` or `DELETE` operations.

*Failure to adhere to these rules risks Cross-Tenant Data Leakage.*
