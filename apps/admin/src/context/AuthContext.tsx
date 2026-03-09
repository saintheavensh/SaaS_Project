'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '@my-saas-app/types';

import { api } from '@/lib/api';

interface AuthState {
    user: User | null;
    role: Role | null;
    token: string | null; // Virtual token status for UI
}

interface AuthContextType extends AuthState {
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

interface LoginResponse {
    user: User;
    refreshToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        role: null,
        token: null,
    });

    const login = useCallback(async (credentials: { email: string; password: string }) => {
        const authData = await api.post<LoginResponse>('/auth/login', credentials);

        if (authData.user.role !== 'super-admin') {
            throw new Error('Access denied: Unauthorized role');
        }

        setState({ user: authData.user, role: authData.user.role, token: 'session' });
        localStorage.setItem('admin_auth_user', JSON.stringify(authData.user));
        document.cookie = `admin_auth_role=${authData.user.role}; path=/; max-age=3600`;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout request failed', error);
        }
        setState({ user: null, role: null, token: null });
        localStorage.removeItem('admin_auth_user');
        localStorage.removeItem('admin_auth_token');
        document.cookie = 'admin_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
    }, []);

    useEffect(() => {
        const userJson = localStorage.getItem('admin_auth_user');

        if (userJson) {
            try {
                const user = JSON.parse(userJson) as User;
                requestAnimationFrame(() => {
                    setState({ user, role: user.role, token: 'session' });
                });
            } catch {
                localStorage.removeItem('admin_auth_user');
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
