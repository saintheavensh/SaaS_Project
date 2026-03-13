import { Context } from 'hono';
import { AppEnv } from '../../../core/types/app-env.js';
import { LedgerService } from '../service/ledger.service.js';
import { LedgerRepository } from '../repository/ledger.repository.js';
import { InventoryRepository } from '../../inventory/repository.js';
import { MoveStockSchema, FinalizeOpnameSchema } from '../schemas/ledger.schemas.js';
import { db } from '../../../core/db.js';

export class LedgerController {
    /**
     * Handle manual stock movement requests
     */
    async moveStock(c: Context<AppEnv>) {
        const tenantId = c.get('tenantId') as string;
        if (!tenantId) throw new Error('Tenant ID is required');

        const body = await c.req.json();
        const validated = MoveStockSchema.parse(body);

        const ledgerRepo = new LedgerRepository(db, tenantId);
        const inventoryRepo = new InventoryRepository(db, tenantId);
        const service = new LedgerService(tenantId, ledgerRepo, inventoryRepo);

        await service.logStockChange(
            validated.productId,
            validated.batchId,
            validated.delta
        );

        return c.json({
            success: true,
            message: 'Stock movement recorded successfully',
        });
    }

    /**
     * Finalize an opname session
     */
    async finalizeOpname(c: Context<AppEnv>) {
        const tenantId = c.get('tenantId') as string;
        if (!tenantId) throw new Error('Tenant ID is required');

        const body = await c.req.json();
        const validated = FinalizeOpnameSchema.parse(body);

        const ledgerRepo = new LedgerRepository(db, tenantId);
        const inventoryRepo = new InventoryRepository(db, tenantId);
        const service = new LedgerService(tenantId, ledgerRepo, inventoryRepo);

        await service.finalizeOpnameSession(
            validated.productId,
            validated.batchId,
            validated.systemStock,
            validated.countedStock
        );

        return c.json({
            success: true,
            message: 'Opname finalized successfully',
        });
    }
}
