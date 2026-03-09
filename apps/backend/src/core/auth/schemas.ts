import { z } from 'zod';

/**
 * Registration request schema
 */
export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
});

/**
 * Login request schema
 */
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

/**
 * Auth response schema (token data)
 */
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
        id: z.string(),
        tenantId: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
