import { z } from 'zod';

/**
 * Schema for creating a new role
 */
export const CreateRoleSchema = z.object({
    name: z.string().min(1, 'Role name is required').max(50),
    description: z.string().optional(),
});

/**
 * Schema for updating an existing role
 */
export const UpdateRoleSchema = CreateRoleSchema.partial();

/**
 * Schema for route parameters with role ID
 */
export const RoleIdParamSchema = z.object({
    id: z.string().uuid('Invalid role ID format'),
});

/**
 * Schema for role response (safe for API output)
 */
export const RoleResponseSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Types inferred from schemas
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type RoleResponse = z.infer<typeof RoleResponseSchema>;
