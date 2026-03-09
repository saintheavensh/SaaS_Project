import bcrypt from 'bcryptjs';
import { eq, and, InferSelectModel } from 'drizzle-orm';
import { db } from '../../core/db.js';
import { users, roles } from '@my-saas-app/db';
import { CreateUserInput, UpdateUserInput, UserResponse } from './schemas.js';

type UserTable = typeof users;
type RoleTable = typeof roles;

/**
 * Map database user and role to UserResponse
 */
const mapToUserResponse = (user: InferSelectModel<UserTable>, roleName: string): UserResponse => ({
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    name: user.name,
    role: roleName,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
});

/**
 * Get users scoped by tenant
 */
export const getUsersService = async (tenantId: string): Promise<UserResponse[]> => {
    const results = await db
        .select({
            user: users,
            role: roles,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(eq(users.tenantId, tenantId));

    return (results as { user: InferSelectModel<UserTable>; role: InferSelectModel<RoleTable> | null }[]).map((r) =>
        mapToUserResponse(r.user, r.role?.name || 'user')
    );
};

/**
 * Get user by ID scoped by tenant
 */
export const getUserByIdService = async (tenantId: string, id: string): Promise<UserResponse | null> => {
    const [result] = await db
        .select({
            user: users,
            role: roles,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(
            and(
                eq(users.tenantId, tenantId),
                eq(users.id, id)
            )
        )
        .limit(1);

    if (!result) return null;
    return mapToUserResponse(result.user, result.role?.name || 'user');
};

/**
 * Create a new user within a tenant
 */
export const createUserService = async (tenantId: string, input: CreateUserInput): Promise<UserResponse> => {
    // Check if email already exists
    const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

    if (existing) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 10);

    // Get role ID if name provided, or use default 'user'
    let roleId = input.roleId;
    let roleName = 'user';

    if (!roleId) {
        const [defaultRole] = await db.select().from(roles).where(eq(roles.name, 'user')).limit(1);
        if (!defaultRole) throw new Error('Default role not found. Please seed roles.');
        roleId = defaultRole.id;
    } else {
        const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
        if (role) roleName = role.name;
    }

    const [newUser] = await db.insert(users).values({
        tenantId,
        email: input.email,
        name: input.name,
        passwordHash,
        roleId: roleId!,
    }).returning();

    return mapToUserResponse(newUser, roleName);
};

/**
 * Update user details
 */
export const updateUserService = async (tenantId: string, id: string, input: UpdateUserInput): Promise<UserResponse> => {
    const [existing] = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.tenantId, tenantId),
                eq(users.id, id)
            )
        )
        .limit(1);

    if (!existing) {
        throw new Error('User not found');
    }

    const updateData: Partial<InferSelectModel<UserTable>> & { updatedAt: Date } = {
        ...(input.name !== undefined ? { name: input.name } : {}),
        updatedAt: new Date(),
    };

    if (input.password) {
        updateData.passwordHash = await bcrypt.hash(input.password, 10);
    }

    if (input.roleId) {
        const [role] = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
        if (!role) throw new Error('Invalid role ID');
        updateData.roleId = input.roleId;
    }

    const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(
            and(
                eq(users.tenantId, tenantId),
                eq(users.id, id)
            )
        )
        .returning();

    // Get current role name
    const [role] = await db.select().from(roles).where(eq(roles.id, updatedUser.roleId)).limit(1);

    return mapToUserResponse(updatedUser, role?.name || 'user');
};

/**
 * Get authenticated user profile (alias for getUserById for now)
 */
export const getProfileService = async (tenantId: string, userId: string): Promise<UserResponse> => {
    const user = await getUserByIdService(tenantId, userId);
    if (!user) throw new Error('Profile not found');
    return user;
};
