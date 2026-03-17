import { z } from 'zod';

export const CreateCompatibilitySchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  deviceId: z.string().uuid('Invalid device ID format'),
});

export const UpdateCompatibilitySchema = CreateCompatibilitySchema.partial();

export const CompatibilityIdParamSchema = z.object({
  id: z.string().uuid('Invalid compatibility ID format'),
});
