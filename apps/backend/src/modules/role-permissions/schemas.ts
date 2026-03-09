import { z } from 'zod';

/**
 * Schema for assigning a permission to a role
 */
export const AssignPermissionToRoleSchema = z.object({
    roleId: z.string().uuid('Invalid role ID format'),
    permissionId: z.string().uuid('Invalid permission ID format'),
});

/**
 * Schema for removing a permission from a role
 */
export const RemovePermissionFromRoleSchema = z.object({
    roleId: z.string().uuid('Invalid role ID format'),
    permissionId: z.string().uuid('Invalid permission ID format'),
});

// Types inferred from schemas
export type AssignPermissionToRoleInput = z.infer<typeof AssignPermissionToRoleSchema>;
export type RemovePermissionFromRoleInput = z.infer<typeof RemovePermissionFromRoleSchema>;
