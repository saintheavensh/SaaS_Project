import { Context } from 'hono';
import { AppEnv } from '../types/app-env.js';
import { Permission } from '../auth/permission.types.js';
import { PermissionRepository } from '../../modules/permissions/repository.js';

/**
 * Resolve all permission names for a given user by traversing:
 * user_roles → roles (tenant filter) → role_permissions → permissions
 *
 * Uses a single JOIN query with DISTINCT to avoid duplicates.
 * Supports request-level caching via the Hono Context to prevent
 * redundant database queries when multiple permission checks occur
 * in a single request.
 *
 * Tenant safety: Only resolves permissions from roles that belong to
 * the same tenant as the authenticated user. This prevents cross-tenant
 * privilege escalation.
 */
export const resolveUserPermissions = async (
    userId: string,
    tenantId: string,
    c?: Context<AppEnv>
): Promise<Permission[]> => {
    // Request-level cache: if permissions were already resolved, return them
    if (c) {
        const cached = c.get('permissions');
        if (cached) {
            return cached;
        }
    }

    const permissionRepo = new PermissionRepository();
    const permissionNames = await permissionRepo.resolveUserPermissions(userId, tenantId);

    // Store in request-level cache
    if (c) {
        c.set('permissions', permissionNames);
    }

    return permissionNames;
};
