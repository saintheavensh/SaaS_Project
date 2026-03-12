import { Database } from '../database/tenant-repository-base.js';
import { db } from '../db.js';
import { eq, InferSelectModel } from 'drizzle-orm';
import { users, tenants, roles } from '@my-saas-app/db';
import bcrypt from 'bcryptjs';
import { RegisterInput } from './schemas.js';

/**
 * Repository for Auth-related operations.
 * Not necessarily bound to a single tenant for global operations like login.
 */
export class AuthRepository {
    private readonly db: Database;
    
    constructor() {
        this.db = db as unknown as Database;
    }

    async findUserByEmail(email: string) {
        const [existing] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
        return existing;
    }

    async findRoleByName(roleName: string) {
        const [role] = await this.db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
        return role;
    }

    async findRoleById(roleId: string) {
        const [role] = await this.db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
        return role;
    }

    async createTenant(name: string, slug: string) {
        const [newTenant] = await this.db.insert(tenants).values({ name, slug }).returning();
        return newTenant;
    }

    async createUser(tenantId: string, email: string, name: string, passwordHash: string, roleId: string) {
        const [newUser] = await this.db.insert(users).values({
            tenantId,
            email,
            name,
            passwordHash,
            roleId,
        }).returning();
        return newUser;
    }
}
