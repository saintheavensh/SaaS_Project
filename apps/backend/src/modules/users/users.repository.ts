import { eq, and, InferSelectModel } from 'drizzle-orm';
import { Database, TenantRepository } from '../../core/database/tenant-repository-base.js';
import { db } from '../../core/db.js';
import { users, roles } from '@my-saas-app/db';
import { CreateUserInput, UpdateUserInput, UserResponse } from './schemas.js';

type UserTable = typeof users;
type RoleTable = typeof roles;

/**
 * Repository for User entities, enforcing tenant isolation.
 */
export class UsersRepository extends TenantRepository {
    constructor(tenantId: string) {
        super(db as unknown as Database, tenantId);
    }

    private mapToUserResponse(user: InferSelectModel<UserTable>, roleName: string): UserResponse {
        return {
            id: user.id,
            tenantId: user.tenantId,
            email: user.email,
            name: user.name,
            role: roleName,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }

    async listUsers(): Promise<UserResponse[]> {
        const results = await this.db
            .select({
                user: users,
                role: roles,
            })
            .from(users)
            .leftJoin(
                roles,
                and(
                    eq(users.roleId, roles.id),
                    this.tenantWhere(roles.tenantId)
                )
            )
            .where(this.tenantWhere(users.tenantId));

        return (results as { user: InferSelectModel<UserTable>; role: InferSelectModel<RoleTable> | null }[]).map((r) =>
            this.mapToUserResponse(r.user, r.role?.name || 'user')
        );
    }

    async findById(id: string): Promise<UserResponse | null> {
        const [result] = await this.db
            .select({
                user: users,
                role: roles,
            })
            .from(users)
            .leftJoin(
                roles,
                and(
                    eq(users.roleId, roles.id),
                    this.tenantWhere(roles.tenantId)
                )
            )
            .where(
                and(
                    this.tenantWhere(users.tenantId),
                    eq(users.id, id)
                )
            )
            .limit(1);

        if (!result) return null;
        return this.mapToUserResponse(result.user, result.role?.name || 'user');
    }

    async createUser(input: Omit<CreateUserInput, 'roleId'>, roleId: string, passwordHash: string): Promise<UserResponse> {
        const [newUser] = await this.db.insert(users).values({
            tenantId: this.tenantId,
            email: input.email,
            name: input.name,
            passwordHash,
            roleId,
        }).returning();

        // Get role name for response
        const [role] = await this.db.select().from(roles).where(
            and(
                eq(roles.id, roleId),
                this.tenantWhere(roles.tenantId)
            )
        ).limit(1);

        return this.mapToUserResponse(newUser, role?.name || 'user');
    }

    async update(id: string, updateData: Partial<InferSelectModel<UserTable>> & { updatedAt: Date }): Promise<UserResponse> {
        const [updatedUser] = await this.db
            .update(users)
            .set(updateData)
            .where(
                and(
                    this.tenantWhere(users.tenantId),
                    eq(users.id, id)
                )
            )
            .returning();

        const [role] = await this.db.select().from(roles).where(
            and(
                eq(roles.id, updatedUser.roleId),
                this.tenantWhere(roles.tenantId)
            )
        ).limit(1);
        return this.mapToUserResponse(updatedUser, role?.name || 'user');
    }

    async findByEmail(email: string) {
         const [existing] = await this.db
            .select()
            .from(users)
            .where(
                and(
                    this.tenantWhere(users.tenantId),
                    eq(users.email, email)
                )
            )
            .limit(1);
        return existing;
    }
}
