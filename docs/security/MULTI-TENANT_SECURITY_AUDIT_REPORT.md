# MULTI-TENANT SECURITY AUDIT REPORT

## SECTION 1 — Repositories missing tenant guard
* **Findings:** Currently, only the `users` module implements the Repository pattern (`src/modules/users/repository.ts`), and it safely extends `TenantRepository`. No other repositories exist. 
* **Conclusion:** The primary risk is not that existing repositories miss guards, but rather that the repository pattern itself is completely missing from almost all modules (`roles`, `tenants`, `permissions`, `role-permissions`, `user-roles`).

## SECTION 2 — Queries missing tenant filters
Numerous direct database queries bypass tenant filters, creating high-severity cross-tenant exposure risks.
* **`src/core/auth/service.ts`:**
  * Login and registration check `users.email` globally without a tenant scope: `await db.select().from(users).where(eq(users.email, input.email))`
* **`src/modules/permissions/service.ts`:**
  * Queries `permissions` table globally without `tenantId` isolation: `await db.select().from(permissions)` (Likely intentional if permissions are global system constants, but architectural intent must be verified).
* **`src/modules/role-permissions/service.ts`:**
  * Inserts and deletes from `rolePermissions` utilizing only `roleId` and `permissionId`. No join or secondary check is performed to guarantee the given `roleId` belongs to the current user's active tenant.
* **`src/modules/user-roles/service.ts`:**
  * Inserts and deletes from `userRoles` using only `userId` and `roleId`. Missing verification that the `role` and `user` share the same `tenantId`, allowing potential privilege escalation by mapping a user to a high-privilege role from a completely different tenant.

## SECTION 3 — Services missing tenant propagation
* **Auth Service (`src/core/auth/service.ts`):** Operations do not accept `tenantId` from the controller. `loginUser` queries the entire database.
* **Permissions Service (`src/modules/permissions/service.ts`):** All methods omit `tenantId` arguments.
* **Relation Services (`src/modules/role-permissions/service.ts` & `src/modules/user-roles/service.ts`):** Methods strictly accept entity IDs (`userId`, `roleId`, `permissionId`) but do not receive `tenantId` to enforce authorization boundaries before mutating the pivot tables.

## SECTION 4 — Controllers with unsafe tenant sourcing
* **Findings:** The controller layer is fundamentally sound in its tenant sourcing.
* **Conclusion:** All inspected controllers (`users`, `roles`, `tenants`) strictly obtain their tenant boundary via the trusted request context populated by middleware, using `c.get('tenantId')`. No controllers were found parsing `tenantId` from unsafe user inputs like `req.query`, `req.json()`, or URL path parameters.

## SECTION 5 — Architectural weaknesses
1. **Direct Database Access:** Services bypass the newly introduced `TenantRepository` pattern entirely. Invoking `db.select()` or `db.insert()` directly in `service.ts` heavily relies on developer discipline, which has already resulted in missing tenant filters inside pivot tables and authentication flows.
2. **Pivot Table Blindness:** Security filters are completely missing when modifying relations (`user_roles`, `role_permissions`). An attacker discovering a valid `roleId` from another workspace could potentially assign it to themselves if their request reaches the service layer.

## SECTION 6 — Recommended fixes
1. **Enforce Repository Pattern:** Strictly forbid `db.*` calls inside `service.ts` files across the entire application.
2. **Implement Repositories:** Scaffold `RoleRepository`, `TenantRepository` (standardized), and mapping repositories that extend `TenantRepository`.
3. **Secure Pivot Operations:** Update `role-permissions` and `user-roles` services to enforce `tenantId`. The repository must verify that the target `roleId` (and `userId`) actually belongs to the active `tenantId` before performing any `INSERT` or `DELETE` on the mapping tables.
4. **Refactor Auth Flow:** Reassess the `auth` service. If emails must be globally unique across all tenants, this should be explicitly documented. Otherwise, `loginUser` must require a tenant identifier (e.g., workspace slug) alongside the email context.
