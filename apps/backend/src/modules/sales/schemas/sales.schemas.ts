import { z } from 'zod';

export const CreateSaleSchema = z.object({
    customerId: z.string().uuid().optional().nullable(),
    items: z.array(
        z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive(),
            sellPrice: z.number().positive(),
        })
    ).min(1, 'Sale must contain at least one item'),
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
