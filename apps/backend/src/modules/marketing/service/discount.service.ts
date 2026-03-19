import { DiscountRepository } from '../repository/discount.repository.js';
import { decimalToMinorUnit, minorUnitToDecimal } from '../../../core/utils/currency.js';

/**
 * Service for Discount logic
 */
export class DiscountService {
    constructor(private readonly repository: DiscountRepository) { }

    /**
     * Calculate discount for a given unit price and customer
     * Returns minor units (cents)
     */
    async calculateDiscount(
        unitPrice: string,
        quantity: number,
        customerId?: string | null
    ): Promise<{ discountAmountCents: number; appliedType: string; appliedValue: string }> {
        const discounts = await this.repository.getActiveDiscounts(customerId);

        if (!discounts || discounts.length === 0) {
            return { discountAmountCents: 0, appliedType: 'NONE', appliedValue: '0' };
        }

        // Simplification: Apply the first valid discount found
        // In the future, this could be "Best for Customer" logic
        const discount = discounts[0];
        const unitPriceCents = decimalToMinorUnit(unitPrice);
        const totalAmountCents = unitPriceCents * quantity;

        let discountAmountCents = 0;

        if (discount.discountType === 'PERCENTAGE') {
            const percentage = parseFloat(discount.value);
            discountAmountCents = Math.floor(totalAmountCents * (percentage / 100));
        } else if (discount.discountType === 'FIXED') {
            const fixedAmountCents = decimalToMinorUnit(discount.value);
            // Fixed discount is typically per-transaction, but for simplicity 
            // per-item logic can be applied if business rule says so.
            // Let's assume per-item for now for line-item auditing.
            discountAmountCents = fixedAmountCents * quantity;
        }

        return {
            discountAmountCents,
            appliedType: discount.discountType,
            appliedValue: discount.value,
        };
    }
}
