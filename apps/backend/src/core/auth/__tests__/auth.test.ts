import { describe, it, expect } from 'vitest';
import * as auth from '../index.js';

describe('Auth Module Skeleton', () => {
    it('should compile and export all components', () => {
        expect(auth.register).toBeDefined();
        expect(auth.login).toBeDefined();
        expect(auth.registerUser).toBeDefined();
        expect(auth.loginUser).toBeDefined();
        expect(auth.RegisterSchema).toBeDefined();
        expect(auth.LoginSchema).toBeDefined();
        expect(auth.authRouter).toBeDefined();
    });
});
