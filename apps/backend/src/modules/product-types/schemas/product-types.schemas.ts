import { z } from 'zod';

/**
 * Zod schema for creating a product type
 */
export const CreateProductTypeSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format'),
  name: z.string().min(1, 'Name is required').max(255),
});

/**
 * Zod schema for updating a product type
 */
export const UpdateProductTypeSchema = CreateProductTypeSchema.partial();

/**
 * Zod schema for product type ID parameter
 */
export const ProductTypeIdParamSchema = z.object({
  id: z.string().uuid('Invalid product type ID format'),
});

/**
 * Zod schema for category ID parameter
 */
export const CategoryIdParamSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format'),
});
