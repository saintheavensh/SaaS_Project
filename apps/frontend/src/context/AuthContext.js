'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        role: null,
        token: null,
    });
    const login = useCallback(async (credentials) => {
        const authData = await api.post('/auth/login', credentials);
        setState({ user: authData.user, role: authData.user.role, token: 'session' });
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        document.cookie = `auth_role=${authData.user.role}; path=/; max-age=3600`;
    }, []);
    const register = useCallback(async (details) => {
        const authData = await api.post('/auth/register', details);
        setState({ user: authData.user, role: authData.user.role, token: 'session' });
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        document.cookie = `auth_role=${authData.user.role}; path=/; max-age=3600`;
    }, []);
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout', {});
        }
        catch (error) {
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
                const user = JSON.parse(userJson);
                requestAnimationFrame(() => {
                    setState({ user, role: user.role, token: 'session' });
                });
            }
            catch (_a) {
                localStorage.removeItem('auth_user');
            }
        }
    }, []);
    return (_jsx(AuthContext.Provider, { value: Object.assign(Object.assign({}, state), { login, register, logout, isAuthenticated: !!state.token }), children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
