import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { RegisterInput, LoginInput, AuthResponse } from './schemas.js';
import { AuthRepository } from './repository.js';

const authRepo = new AuthRepository();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required for production-grade security');
}

/**
 * Register a new user (Database)
 */
export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
    // Check if user exists
    const existing = await authRepo.findUserByEmail(input.email);
    if (existing) {
        throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 10);

    // Get default tenant or create one
    // In a real flow, you might have a tenant identifier, 
    // but for simple register we create a new tenant.
    const newTenant = await authRepo.createTenant(
        `${input.name}'s Workspace`,
        input.email.split('@')[0].toLowerCase() + '-' + Math.random().toString(36).substring(7)
    );

    // Get 'user' role
    const userRole = await authRepo.findRoleByName(newTenant.id, 'user');

    if (!userRole) {
        throw new Error('Default user role not found. Please run database seeding.');
    }

    // Create user
    const newUser = await authRepo.createUser(
        newTenant.id,
        input.email,
        input.name,
        passwordHash,
        userRole.id
    );

    // Generate Token
    const accessToken = await sign({
        sub: newUser.id,
        role: userRole.name,
        tenantId: newUser.tenantId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60
    }, JWT_SECRET, 'HS256');

    return {
        accessToken,
        refreshToken: 'temp_refresh_token',
        user: {
            id: newUser.id,
            tenantId: newUser.tenantId,
            email: newUser.email,
            name: newUser.name || '',
            role: userRole.name,
            createdAt: newUser.createdAt.toISOString(),
            updatedAt: newUser.updatedAt.toISOString(),
        },
    };
};

/**
 * Login an existing user (Database)
 */
export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
    const user = await authRepo.findUserByEmail(input.email);

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Verify Password
    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Get role name
    const role = await authRepo.findRoleById(user.tenantId, user.roleId);
    if (!role) {
        throw new Error('User role configuration error');
    }

    // Generate Token
    const accessToken = await sign({
        sub: user.id,
        role: role.name,
        tenantId: user.tenantId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60
    }, JWT_SECRET, 'HS256');

    return {
        accessToken,
        refreshToken: 'temp_refresh_token',
        user: {
            id: user.id,
            tenantId: user.tenantId,
            email: user.email,
            name: user.name || '',
            role: role.name,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        },
    };
};
