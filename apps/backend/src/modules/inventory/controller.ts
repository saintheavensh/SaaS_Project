import { Context } from 'hono';
import { InventoryService } from './service.js';
import { InventoryRepository } from './repository.js';
import { db } from '../../core/db.js';
import { DeductStockSchema, AddStockSchema } from './schemas/inventory.schemas.js';
import { InsufficientStockError } from '../../core/errors/insufficient-stock.error.js';
import { StockLedgerRepository } from '../ledger/repository/stock-ledger.repository.js';

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
        const stockLedgerRepo = new StockLedgerRepository(db, tenantId);
        const service = new InventoryService(tenantId, repository, stockLedgerRepo);
        
        try {
            const result = await db.transaction(async (tx) => {
                return await service.handleStockOut({
                    productId: validated.productId,
                    quantity: validated.quantity,
                }, tx as any);
            });
            
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
        const stockLedgerRepo = new StockLedgerRepository(db, tenantId);
        const service = new InventoryService(tenantId, repository, stockLedgerRepo);
        
        const result = await service.handleStockIn({
            productId: validated.productId,
            buyPrice: validated.buyPrice,
            quantity: validated.initialStock,
            reference: 'PURCHASE',
        });
        
        return c.json({
            success: true,
            data: result,
        });
    }

    /**
     * Finalize opname
     * [STEP 3 REVISION] - COMMENTED OUT AS PER ARCHITECTURE REVIEW
     */
    /*
    async finalizeOpname(c: Context) {
        const tenantId = c.get('tenantId');
        const body = await c.req.json();
        
        const validated = FinalizeOpnameSchema.parse(body);
        
        const repository = new InventoryRepository(db, tenantId);
        const stockLedgerRepo = new StockLedgerRepository(db, tenantId);
        const service = new InventoryService(tenantId, repository, stockLedgerRepo);
        
        const result = await service.finalizeOpnameSession(validated.sessionId);
        
        return c.json({
            success: true,
            data: result,
        });
    }
    */
}
