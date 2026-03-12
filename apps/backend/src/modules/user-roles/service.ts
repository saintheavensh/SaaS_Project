import { UserRolesRepository } from './user-roles.repository.js';

export const assignRoleToUser = async (tenantId: string, userId: string, roleId: string): Promise<void> => {
    const repo = new UserRolesRepository(tenantId);
    await repo.assignRole(userId, roleId);
};

export const removeRoleFromUser = async (tenantId: string, userId: string, roleId: string): Promise<void> => {
    const repo = new UserRolesRepository(tenantId);
    await repo.removeRole(userId, roleId);
};

export const getRolesByUser = async (tenantId: string, userId: string) => {
    const repo = new UserRolesRepository(tenantId);
    const results = await repo.getRolesByUser(userId);

    return results.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    }));
};
