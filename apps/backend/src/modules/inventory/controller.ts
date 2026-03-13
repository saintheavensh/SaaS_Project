import { Context } from 'hono';
import { InventoryService } from './service.js';
import { InventoryRepository } from './repository.js';
import { db } from '../../core/db.js';
import { DeductStockSchema, AddStockSchema, FinalizeOpnameSchema } from './schemas/inventory.schemas.js';
import { InsufficientStockError } from '../../core/errors/insufficient-stock.error.js';
import { LedgerRepository } from '../ledger/repository/ledger.repository.js';

/**
 * Controller for Inventory endpoints
 */
export class InventoryController {
    /**
     * Deduct stock
     */
    async deductStock(c: Context) {
        const tenantId = c.get('tenantId');
        const body = await c.req.json();
        
        const validated = DeductStockSchema.parse(body);
        
        const repository = new InventoryRepository(db, tenantId);
        const service = new InventoryService(tenantId, repository);
        
        try {
            const result = await service.deductStock(validated.productId, validated.quantity);
            
            return c.json({
                success: true,
                data: result,
            });
        } catch (error) {
            if (error instanceof InsufficientStockError) {
                return c.json({ success: false, message: error.message }, 409);
            }
            throw error;
        }
    }

    /**
     * Add stock from purchase
     */
    async addStock(c: Context) {
        const tenantId = c.get('tenantId');
        const body = await c.req.json();
        
        const validated = AddStockSchema.parse(body);
        
        const repository = new InventoryRepository(db, tenantId);
        const ledgerRepo = new LedgerRepository(db, tenantId);
        const service = new InventoryService(tenantId, repository, ledgerRepo);
        
        const result = await service.addStockFromPurchase(validated);
        
        return c.json({
            success: true,
            data: result,
        });
    }

    /**
     * Finalize opname
     */
    async finalizeOpname(c: Context) {
        const tenantId = c.get('tenantId');
        const body = await c.req.json();
        
        const validated = FinalizeOpnameSchema.parse(body);
        
        const repository = new InventoryRepository(db, tenantId);
        const service = new InventoryService(tenantId, repository);
        
        const result = await service.finalizeOpnameSession(validated.sessionId);
        
        return c.json({
            success: true,
            data: result,
        });
    }
}
