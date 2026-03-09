import { ApiClient } from '@my-saas-app/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = new ApiClient({
    baseUrl: API_URL,
    getTenantId: () => {
        if (typeof window !== 'undefined') {
            const userJson = localStorage.getItem('admin_auth_user');
            if (userJson) {
                try {
                    const user = JSON.parse(userJson);
                    return user.tenantId || null;
                } catch {
                    return null;
                }
            }
        }
        return null;
    },
    onUnauthorized: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_auth_user');
            document.cookie = 'admin_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
        }
    }
});
