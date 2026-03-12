import bcrypt from 'bcryptjs';
import { CreateUserInput, UpdateUserInput, UserResponse } from './schemas.js';
import { UsersRepository } from './users.repository.js';
import { RoleRepository } from '../roles/repository.js';

/**
 * Get users scoped by tenant
 */
export const getUsersService = async (tenantId: string): Promise<UserResponse[]> => {
    const repository = new UsersRepository(tenantId);
    return repository.listUsers();
};

/**
 * Get user by ID scoped by tenant
 */
export const getUserByIdService = async (tenantId: string, id: string): Promise<UserResponse | null> => {
    const repository = new UsersRepository(tenantId);
    return repository.findById(id);
};

/**
 * Create a new user within a tenant
 */
export const createUserService = async (tenantId: string, input: CreateUserInput): Promise<UserResponse> => {
    const repository = new UsersRepository(tenantId);

    // Check if email already exists for this tenant
    const existing = await repository.findByEmail(input.email);
    if (existing) {
        throw new Error('User with this email already exists');
    }

    // Get role ID if name provided, or use default 'user'
    let roleId = input.roleId;

    if (!roleId) {
        // Use RoleRepository to fetch roles
        const roleRepo = new RoleRepository(tenantId);
        const defaultRole = await roleRepo.findByName('user');
        
        if (!defaultRole) throw new Error('Default role not found. Please seed roles.');
        roleId = defaultRole.id;
    } else {
        const roleRepo = new RoleRepository(tenantId);
        const role = await roleRepo.findById(roleId!);
        
        if (!role) throw new Error('Invalid role ID');
    }

    // Remove roleId from input to match UsersRepository signature
    const { roleId: _omittedRoleId, ...userData } = input;
    const passwordHash = await bcrypt.hash(input.password, 10);
    return repository.createUser(userData, roleId, passwordHash);
};

/**
 * Update user details
 */
export const updateUserService = async (tenantId: string, id: string, input: UpdateUserInput): Promise<UserResponse> => {
    const repository = new UsersRepository(tenantId);

    const existing = await repository.findById(id);
    if (!existing) {
        throw new Error('User not found');
    }

    const updateData: any = {
        ...(input.name !== undefined ? { name: input.name } : {}),
        updatedAt: new Date(),
    };

    if (input.password) {
        updateData.passwordHash = await bcrypt.hash(input.password, 10);
    }

    if (input.roleId) {
        const roleRepo = new RoleRepository(tenantId);
        const role = await roleRepo.findById(input.roleId);
        if (!role) throw new Error('Invalid role ID');
        updateData.roleId = input.roleId;
    }

    return repository.update(id, updateData);
};

/**
 * Get authenticated user profile (alias for getUserById for now)
 */
export const getProfileService = async (tenantId: string, userId: string): Promise<UserResponse> => {
    const user = await getUserByIdService(tenantId, userId);
    if (!user) throw new Error('Profile not found');
    return user;
};
