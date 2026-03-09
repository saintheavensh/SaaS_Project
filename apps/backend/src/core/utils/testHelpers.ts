import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

/**
 * Generate a test JWT token for E2E testing
 * @param userId User ID to include in 'sub'
 * @param tenantId Tenant ID scope
 * @param role Role assigned to the user (defaults to 'user')
 */
export const generateTestToken = (
    userId: string,
    tenantId: string,
    role: string = 'user'
): string => {
    return jsonwebtoken.sign(
        {
            sub: userId,
            tenantId,
            role,
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        {
            expiresIn: '1h',
            algorithm: 'HS256'
        }
    );
};

/**
 * Standardized headers for E2E requests
 */
export const getHeaders = (token?: string, tenantId?: string): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
    }

    return headers;
};
