import { z } from 'zod';

export const MoveStockSchema = z.object({
    productId: z.string().uuid(),
    batchId: z.string().uuid(),
    delta: z.number(),
});

export const FinalizeOpnameSchema = z.object({
    productId: z.string().uuid(),
    batchId: z.string().uuid(),
    systemStock: z.number(),
    countedStock: z.number(),
});

export type MoveStockInput = z.infer<typeof MoveStockSchema>;
export type FinalizeOpnameInput = z.infer<typeof FinalizeOpnameSchema>;
