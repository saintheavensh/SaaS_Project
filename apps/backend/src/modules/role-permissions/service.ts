import { RolePermissionsRepository } from './role-permissions.repository.js';

export const assignPermissionToRole = async (tenantId: string, roleId: string, permissionId: string): Promise<void> => {
    const repo = new RolePermissionsRepository(tenantId);
    await repo.assignPermission(roleId, permissionId);
};

export const removePermissionFromRole = async (tenantId: string, roleId: string, permissionId: string): Promise<void> => {
    const repo = new RolePermissionsRepository(tenantId);
    await repo.removePermission(roleId, permissionId);
};

export const getPermissionsByRole = async (tenantId: string, roleId: string) => {
    const repo = new RolePermissionsRepository(tenantId);
    const results = await repo.getPermissionsByRole(roleId);

    return results.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));
};
