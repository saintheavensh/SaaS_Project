import { z } from 'zod';

/**
 * Schema for creating a new tenant
 */
export const CreateTenantSchema = z.object({
    name: z.string().min(1, 'Tenant name is required').max(255),
    slug: z.string().min(1, 'Slug is required').max(255),
    description: z.string().optional(),
});

/**
 * Schema for updating an existing tenant
 */
export const UpdateTenantSchema = CreateTenantSchema.partial();

/**
 * Schema for route parameters with tenant ID
 */
export const TenantIdParamSchema = z.object({
    id: z.string().uuid('Invalid tenant ID format'),
});

/**
 * Schema for tenant response (safe for API output)
 */
export const TenantResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Types inferred from schemas
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;
export type TenantResponse = z.infer<typeof TenantResponseSchema>;
