import { describe, it, expect } from 'vitest';
import * as tenant from '../index.js';

describe('Tenant Module Skeleton', () => {
    it('should compile and export all components', () => {
        expect(tenant.create).toBeDefined();
        expect(tenant.getOne).toBeDefined();
        expect(tenant.update).toBeDefined();
        expect(tenant.remove).toBeDefined();
        expect(tenant.createTenant).toBeDefined();
        expect(tenant.getTenantById).toBeDefined();
        expect(tenant.CreateTenantSchema).toBeDefined();
        expect(tenant.tenantRouter).toBeDefined();
    });
});
