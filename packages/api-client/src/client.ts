import { AuthResponse } from '@my-saas-app/types';

export interface ApiClientConfig {
    baseUrl: string;
    getToken?: () => string | null;
    getTenantId?: () => string | null;
    onUnauthorized?: () => void;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

class ApiClient {
    private config: ApiClientConfig;

    constructor(config: ApiClientConfig) {
        this.config = config;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.config.baseUrl}${path}`;
        const headers = new Headers(options.headers);

        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        const token = this.config.getToken?.();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const tenantId = this.config.getTenantId?.();
        if (tenantId) {
            headers.set('X-Tenant-ID', tenantId);
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (response.status === 401) {
            this.config.onUnauthorized?.();
        }

        const result = (await response.json()) as ApiResponse<T>;

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'API request failed');
        }

        return result.data;
    }

    async get<T>(path: string, options?: RequestInit): Promise<T> {
        return this.request<T>(path, { ...options, method: 'GET' });
    }

    async post<T, B = any>(path: string, body: B, options?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T, B = any>(path: string, body: B, options?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T, B = any>(path: string, body: B, options?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(path: string, options?: RequestInit): Promise<T> {
        return this.request<T>(path, { ...options, method: 'DELETE' });
    }
}

export { ApiClient };
