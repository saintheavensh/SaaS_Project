# RBAC Permission Guard Guide

The backend uses a centralized Role-Based Access Control (RBAC) architecture to secure endpoints. Authorization is handled at the **router layer** using the `permissionGuard` helper.

## How it Works

The `permissionGuard` is a Hono middleware that:
1. Validates the authenticated user context (set by `authMiddleware`).
2. Checks the request-level permission cache to avoid N+1 database queries.
3. If not cached, executes an optimized SQL JOIN (`user_roles → roles → role_permissions → permissions`) to resolve all available permissions for the user. (This is safely scoped to the requesting user's `tenantId`).
4. Rejects the request with a `403 FORBIDDEN` response if the required permission is absent.
5. Calls `next()` if the user is authorized.

## Protecting New Routes

Controllers should **not** contain any RBAC authorization logic. Instead, declare the required permissions directly in your module's router definition.

```typescript
import { Hono } from 'hono';
import { permissionGuard } from '../../core/auth/permission-guard.js';
import * as myController from './controller.js';

export const myRouter = new Hono();

// Example: Requires 'item.read' permission
myRouter.get('/', permissionGuard('item.read'), myController.listItems);

// Example: Requires 'item.create' permission
myRouter.post('/', permissionGuard('item.create'), myController.createItem);
```

## Naming Conventions

Permissions use a `{resource}.{action}` naming convention.
Always use standard CRUD actions where possible:

- `read`   — (GET methods)
- `create` — (POST methods)
- `update` — (PUT/PATCH methods)
- `delete` — (DELETE methods)

**Examples:**
- `tenant.read`
- `user.update`
- `role.delete`
- `invoice.create`

## Forbidden Response Standard

If a user lacks the required permission, the guard automatically intercepts the request and returns a standardized JSON error response:

```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to perform this action"
}
```

This ensures frontend clients can cleanly catch and handle authorization failures.
