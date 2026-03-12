import { requirePermission } from '../middlewares/requirePermission.js';
import { Permission } from './permission.types.js';

/**
 * Reusable helper that acts as a router-level guard.
 * It enforces RBAC permission checks before allowing access to an endpoint.
 *
 * @param permissionName - The required permission (e.g., 'tenant.read')
 * @returns Hono middleware that enforces the permission
 */
export const permissionGuard = (permissionName: Permission) => {
    return requirePermission(permissionName);
};
