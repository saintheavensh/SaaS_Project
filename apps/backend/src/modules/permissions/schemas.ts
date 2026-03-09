import { z } from 'zod';

/**
 * Schema for creating a new permission
 */
export const CreatePermissionSchema = z.object({
    name: z.string().min(1, 'Permission name is required').max(255),
    description: z.string().optional(),
});

/**
 * Schema for updating an existing permission
 */
export const UpdatePermissionSchema = CreatePermissionSchema.partial();

/**
 * Schema for route parameters with permission ID
 */
export const PermissionIdParamSchema = z.object({
    id: z.string().uuid('Invalid permission ID format'),
});

/**
 * Schema for permission response (safe for API output)
 */
export const PermissionResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Types inferred from schemas
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof UpdatePermissionSchema>;
export type PermissionResponse = z.infer<typeof PermissionResponseSchema>;
