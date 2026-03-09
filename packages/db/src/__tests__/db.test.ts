import { describe, it, expect } from 'vitest';
import * as db from '../index.js';

describe('Database Package Skeleton', () => {
    it('should compile and export all components', () => {
        expect(db.initDb).toBeDefined();
        expect(db.tenants).toBeDefined();
        expect(db.users).toBeDefined();
        expect(db.roles).toBeDefined();
    });
});
