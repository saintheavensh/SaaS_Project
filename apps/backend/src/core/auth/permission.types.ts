export type Permission =
    | 'tenant.read'
    | 'tenant.create'
    | 'tenant.update'
    | 'tenant.delete'
    | 'user.read'
    | 'user.create'
    | 'user.update'
    | 'user.delete'
    | 'role.read'
    | 'role.create'
    | 'role.update'
    | 'role.delete'
    | 'permission.read'
    | 'permission.create'
    | 'permission.update'
    | 'permission.delete';

export const PERMISSIONS: Permission[] = [
    'tenant.read',
    'tenant.create',
    'tenant.update',
    'tenant.delete',
    'user.read',
    'user.create',
    'user.update',
    'user.delete',
    'role.read',
    'role.create',
    'role.update',
    'role.delete',
    'permission.read',
    'permission.create',
    'permission.update',
    'permission.delete'
];
