import { z } from 'zod';

/**
 * Zod schema for creating a device
 */
export const CreateDeviceSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  series: z.string().optional().nullable(),
  model: z.string().min(1, 'Model is required'),
  code: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  colors: z.array(z.string()).optional().nullable(),
  specs: z.string().optional().nullable(),
  chipset: z.string().optional().nullable(),
  specifications: z.record(z.any()).optional().nullable(),
});

/**
 * Zod schema for updating a device
 */
export const UpdateDeviceSchema = CreateDeviceSchema.partial();
