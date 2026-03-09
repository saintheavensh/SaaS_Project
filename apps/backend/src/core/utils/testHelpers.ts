import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

/**
 * Generate a test JWT token
 */
export const generateTestToken = (userId: string, tenantId: string): string => {
    return jsonwebtoken.sign(
        { sub: userId, tenantId },
        JWT_SECRET,
        { expiresIn: '1h' }
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
