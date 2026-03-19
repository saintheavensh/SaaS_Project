import { z } from 'zod';

/**
 * User creation schema
 */
export const CreateUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    fullName: z.string().min(1, 'Full name is required'),
    roleId: z.string().uuid('Invalid Role ID').optional(),
});

/**
 * User update schema
 */
export const UpdateUserSchema = CreateUserSchema.partial();

/**
 * User response schema
 */
export const UserResponseSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    email: z.string().email(),
    fullName: z.string().nullable(),
    role: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

/**
 * User ID parameter schema
 */
export const UserIdParamSchema = z.object({
    id: z.string().uuid('Invalid User ID'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
