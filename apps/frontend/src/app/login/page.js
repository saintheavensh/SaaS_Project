'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            router.push('/dashboard');
        }
        catch (err) {
            console.error('Login failed:', err);
            alert(err instanceof Error ? err.message : 'Login failed');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative", children: [_jsx("div", { className: "absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" }), _jsx("div", { className: "absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[128px]" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-md w-full", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30", children: _jsx(Lock, { className: "text-white w-8 h-8" }) }) }), _jsx("h2", { className: "text-3xl font-bold text-white text-center mb-2", children: "Welcome Back" }), _jsx("p", { className: "text-slate-400 text-center mb-8", children: "Login to manage your business" }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all", placeholder: "name@company.com", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] })] }), _jsxs("button", { type: "submit", className: "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center group", children: [_jsx("span", { children: "Sign In" }), _jsx(ArrowRight, { className: "ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" })] })] }), _jsx("div", { className: "mt-8 pt-8 border-t border-slate-800 text-center", children: _jsxs("p", { className: "text-slate-500 text-sm", children: ["Don't have an account? ", _jsx("span", { className: "text-blue-400 font-medium cursor-pointer hover:underline", children: "Contact sales" })] }) })] }) })] }));
};
export default LoginPage;
