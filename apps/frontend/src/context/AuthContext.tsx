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
    register: (details: { email: string; name: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface LoginResponse {
    user: User;
    refreshToken: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        role: null,
        token: null,
    });

    const login = useCallback(async (credentials: { email: string; password: string }) => {
        const authData = await api.post<LoginResponse>('/auth/login', credentials);

        setState({ user: authData.user, role: authData.user.role, token: 'session' });
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        document.cookie = `auth_role=${authData.user.role}; path=/; max-age=3600`;
    }, []);

    const register = useCallback(async (details: { email: string; name: string; password: string }) => {
        const authData = await api.post<LoginResponse>('/auth/register', details);

        setState({ user: authData.user, role: authData.user.role, token: 'session' });
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        document.cookie = `auth_role=${authData.user.role}; path=/; max-age=3600`;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout request failed', error);
        }
        setState({ user: null, role: null, token: null });
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token'); // Cleanup old legacy token if any
        document.cookie = 'auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
    }, []);

    useEffect(() => {
        const userJson = localStorage.getItem('auth_user');

        if (userJson) {
            try {
                const user = JSON.parse(userJson) as User;
                requestAnimationFrame(() => {
                    setState({ user, role: user.role, token: 'session' });
                });
            } catch {
                localStorage.removeItem('auth_user');
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, isAuthenticated: !!state.token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
