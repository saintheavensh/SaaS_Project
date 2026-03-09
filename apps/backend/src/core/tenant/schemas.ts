import { z } from 'zod';

/**
 * Tenant creation schema
 */
export const CreateTenantSchema = z.object({
    name: z.string().min(2),
    domain: z.string().optional(),
    config: z.record(z.unknown()).optional(),
});

/**
 * Tenant update schema
 */
export const UpdateTenantSchema = CreateTenantSchema.partial();

/**
 * Tenant response schema
 */
export const TenantResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    domain: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;
export type TenantResponse = z.infer<typeof TenantResponseSchema>;
