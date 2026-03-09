export type Role = 'admin' | 'user' | 'super-admin';

export interface User {
    id: string;
    tenantId: string;
    email: string;
    name: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    tenantId: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
