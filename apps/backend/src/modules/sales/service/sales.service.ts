import { SalesRepository } from '../repository/sales.repository.js';
import { CreateSaleInput } from '../schemas/sales.schemas.js';
import { db } from '../../../core/db.js';

/**
 * Service for Sales operations.
 * Handles transactional workflow for creating sales and later inventory deduction.
 */
export class SalesService {
    constructor(
        private readonly tenantId: string,
        private readonly repository: SalesRepository
    ) {}

    /**
     * Creates a sale transaction
     */
    async createSale(input: CreateSaleInput): Promise<string> {
        // Calculate total amount from items (could also be taken from input, but calculating from items is safer)
        const totalAmount = input.items.reduce((sum, item) => sum + (item.quantity * item.sellPrice), 0);

        let finalSaleId: string = '';

        await db.transaction(async (tx) => {
            // 1. Create sale record
            const newSale = await this.repository.createSale({
                customerId: input.customerId,
                totalAmount,
                status: 'COMPLETED',
            }, tx);

            finalSaleId = newSale.id;

            // 2. Loop through items
            for (const item of input.items) {
                // 3. Create sale_items
                const saleItem = await this.repository.createSaleItem({
                    saleId: newSale.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    sellPrice: item.sellPrice,
                }, tx);

                // FIFO deduction will be integrated later
            }
        });

        return finalSaleId;
    }
}
