import { z } from 'zod';

/**
 * Schema for stock deduction
 */
export const DeductStockSchema = z.object({
    productId: z.string().uuid('Invalid Product ID'),
    quantity: z.number().positive('Quantity must be greater than zero'),
});

/**
 * Schema for adding stock from purchase
 */
export const AddStockSchema = z.object({
    productId: z.string().uuid('Invalid Product ID'),
    buyPrice: z.string().min(1, 'Buy price is required'),
    sellPrice: z.string().min(1, 'Sell price is required'),
    initialStock: z.number().int().positive('Initial stock must be a positive integer'),
});

/**
 * Schema for opname finalization
 */
export const FinalizeOpnameSchema = z.object({
    sessionId: z.string().uuid('Invalid Session ID'),
});

export type DeductStockInput = z.infer<typeof DeductStockSchema>;
export type AddStockInput = z.infer<typeof AddStockSchema>;
export type FinalizeOpnameInput = z.infer<typeof FinalizeOpnameSchema>;
