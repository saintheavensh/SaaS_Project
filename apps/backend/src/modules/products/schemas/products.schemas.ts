import { z } from 'zod';

/**
 * Product creation schema
 */
export const CreateProductSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    categoryId: z.string().uuid().optional(),
});

/**
 * Product update schema
 */
export const UpdateProductSchema = CreateProductSchema.partial();

/**
 * Product ID parameter schema
 */
export const ProductIdParamSchema = z.object({
    id: z.string().uuid('Invalid Product ID'),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductIdParam = z.infer<typeof ProductIdParamSchema>;
