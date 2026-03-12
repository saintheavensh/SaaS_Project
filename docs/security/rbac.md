# RBAC Integration Readiness Report

## 1. Authentication Context

**Findings:**
- Authentication is handled by `authMiddleware.ts` which verifies a JWT (via HTTP-only cookie or Bearer token).
- Upon successful verification, it injects `userId`, `role`, and `tenantId` into the Hono Context (`c.set()`).
- `req.user` is not technically used; instead, the framework leverages Hono's `c.get('userId')` and `c.get('tenantId')`.

**Risks:**
- The context variables are retrieved using manual type casting (`c.get('userId') as string | undefined`) rather than leveraging a strongly-typed Hono Environment (`Env` or `Variables` generic). This could lead to runtime errors if typos exist in the key names.

**Recommended Fixes:**
- Define a global `AppBindings` or `Variables` type for Hono to strongly type `c.get('userId')` and `c.get('tenantId')` so that existence and types are guaranteed at compile time without manual casting.

---

## 2. RBAC Query Layer

**Findings:**
- A centralized RBAC service/resolver exists: `resolveUserPermissions(userId, tenantId, c)` in `permissionResolver.ts`.
- It performs an optimized single JOIN query (`user_roles` → `roles` → `role_permissions` → `permissions`) and filters roles securely by `tenantId`.
- It includes a request-level cache via Hono context (`c.set('permissions', permissionNames)`) to prevent duplicate DB queries during a single request lifecycle.

**Risks:**
- The logic within `resolveUserPermissions` is solid and performant. There are no immediate risks here. It correctly isolates role resolution to the user's active tenant.

**Recommended Fixes:**
- None needed for the query layer itself. It is well-architected for a router-level guard.

---

## 3. Router Architecture

**Findings:**
- Routers are modularised (`src/modules/*/routes.ts`) and combined in a central `src/routes.ts`.
- Middlewares (`authMiddleware` and `tenantContextMiddleware`) are currently applied globally to protected routes using wildcard matching (`router.use('/tenants/*', ...)`).
- The `permissionGuard` wrapper is already partially defined and utilized in `tenantRouter` (e.g., `permissionGuard('tenant.read')`).

**Risks:**
- `permissionGuard` currently uses the `requirePermission` middleware under the hood, but this logic assumes `userId` and `tenantId` are strictly available in the context. If a route matches a controller that doesn't have the global `router.use()` middleware applied correctly, the guard will reject with a 401 instead of properly verifying.

**Recommended Fixes:**
- Ensure `authMiddleware` and `tenantContextMiddleware` are strictly mounted *before* any modular routers that leverage `permissionGuard` to guarantee context availability.

---

## 4. Tenant Isolation Risks

**Findings:**
- `tenantContextMiddleware.ts` resolves the active tenant ID. It prioritizes the context `tenantId` (from JWT) over the `X-Tenant-ID` header.
- The `tenants` module service (`getTenantsService`, `getTenantByIdService`) queries the `tenants` table directly without filtering by `tenantId`. This is expected for root-level tenant management.
- The `resolveUserPermissions` completely restricts permission resolution to the `tenantId` provided, ensuring users only get permissions for the active tenant.

**Risks:**
- Controllers and services currently do not receive the `tenantId` dynamically to filter their own DB queries (e.g., if checking an `inventory` or `product` lookup, it must include `where(eq(products.tenantId, activeTenantId))`). If a controller trusts a URL parameter (like `/:id`) without validating the entity belongs to the active tenant, cross-tenant data leaks can occur.
- A user without a `tenantId` in their JWT can pass any `X-Tenant-ID` header and contextually "switch" tenants. If they have wide-reaching module permissions, this is a severe privilege escalation vector.

**Recommended Fixes:**
- Enforce that `X-Tenant-ID` can only be used by strictly defined `super-admin` roles, or completely lock down the context priority so that JWT `tenantId` cannot be overridden.
- All non-root business services (e.g., users, products) must accept `tenantId` as an argument and enforce `eq(table.tenantId, tenantId)` in their repository queries.

---

## 5. Permission Naming

**Findings:**
- Permission records follow a strict `resource.action` convention (e.g., `tenant.read`, `tenant.create`, `user.delete`).
- The database seeds (`seed.ts`) successfully document standard system and tenant permissions.

**Risks:**
- Permission names are entirely string-based (`string`) across the application, meaning typos like `permissionGuard('tenannt.create')` will silently compile but fail at runtime.

**Recommended Fixes:**
- Extract all permission strings into a TypeScript literal union (e.g., `type Permission = 'tenant.read' | 'user.create' | ...`) or a constant mapping.
- Update `requirePermission(permissionName: Permission)` to enforce strict typing.

---

## 6. Middleware Chain

**Findings:**
- Current chain order in `routes.ts` and `server.ts`:
  1. `auditMiddleware`
  2. `authMiddleware`
  3. `tenantContextMiddleware`
  4. Router/Controller logic (with `permissionGuard` applied specific routes)

**Risks:**
- The chain order is correct. `auditMiddleware` tracks the raw request, `authMiddleware` asserts identity, `tenantContext` resolves the tenant boundary, and finally, `permissionGuard` executes authorized behavior.
- The only conflict risk is if `authMiddleware` fails to reject unauthorized users, allowing an unauthenticated context to reach `tenantContextMiddleware`. Currently, `authMiddleware` correctly drops if an invalid token is passed.

**Recommended Fixes:**
- Maintain current middleware order. Standardize the `requirePermission` 403 response format to match the global API standard if it deviates.

---

## 7. Type Safety

**Findings:**
- TypeScript is used strictly across DB schema, models, and controllers (via Zod).
- The `req.user` paradigm is avoided entirely in favor of Hono's `.get()` and `.set()` map.

**Risks:**
- Hono context keys (`userId`, `tenantId`, `permissions`) are untyped, meaning developers must remember to use `as string` or `as string[]` everywhere context variables are pulled via `.get()`. This eliminates compiler guarantees for context injections.

**Recommended Fixes:**
- Create an `AppEnv` type for Hono:
  ```typescript
  export type AppEnv = {
      Variables: {
          userId: string;
          tenantId: string;
          role: string;
          permissions: Permission[];
          jwtPayload: any;
      }
  }
  ```
- Inject `AppEnv` into all `new Hono<AppEnv>()` and `Context<AppEnv>` definitions.

---

## IMPLEMENTATION READINESS SCORE

**Score: 8.5 / 10**

The system is structurally highly prepared for centralized router-level RBAC. The database schema, seed data, unified JOIN queries, and middleware sequencing are already in an excellent state. The lacking components are strictly around Hono context type safety, tenant filtration in services, and string-literal permission typing.

### Exact Next Step

1. **Implement Type Safety for the Context and Permissions:** Draft an `AppEnv` generic for Hono's `Context` that defines `userId` and `tenantId`, ensuring they cannot be accessed as `any` or `undefined` implicitly. At the same time, create a `Permission` literal type or Enum replacing raw strings in `permission-guard.ts` to prevent runtime typos.
