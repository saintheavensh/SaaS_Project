import { z } from 'zod';

/**
 * Schema for assigning a role to a user
 */
export const AssignRoleToUserSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    roleId: z.string().uuid('Invalid role ID format'),
});

/**
 * Schema for removing a role from a user
 */
export const RemoveRoleFromUserSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    roleId: z.string().uuid('Invalid role ID format'),
});

// Types inferred from schemas
export type AssignRoleToUserInput = z.infer<typeof AssignRoleToUserSchema>;
export type RemoveRoleFromUserInput = z.infer<typeof RemoveRoleFromUserSchema>;
