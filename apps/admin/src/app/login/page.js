'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
const AdminLoginPage = () => {
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
            console.error('Admin login failed:', err);
            alert(err instanceof Error ? err.message : 'Login failed');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" }), _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "w-full max-w-lg z-10", children: [_jsxs("div", { className: "text-center mb-10", children: [_jsx("div", { className: "inline-block p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 mb-6 backdrop-blur-xl", children: _jsx(ShieldCheck, { className: "w-12 h-12 text-amber-400" }) }), _jsx("h1", { className: "text-5xl font-black text-white tracking-tighter mb-2 italic uppercase", children: "System Access" }), _jsx("p", { className: "text-indigo-300 font-medium", children: "ADMINISTRATIVE INTERFACE LEVEL 4" })] }), _jsxs("div", { className: "bg-indigo-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)]", children: [_jsxs("form", { onSubmit: handleLogin, className: "space-y-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] ml-4", children: "Identifier" }), _jsxs("div", { className: "relative group", children: [_jsx(Mail, { className: "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-indigo-950/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono placeholder:text-indigo-700", placeholder: "Root Terminal ID", required: true })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] ml-4", children: "Encryption Logic" }), _jsxs("div", { className: "relative group", children: [_jsx(Lock, { className: "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-indigo-950/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono placeholder:text-indigo-700", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] })] }), _jsxs("button", { type: "submit", className: "w-full bg-gradient-to-br from-amber-400 to-orange-500 text-indigo-950 font-black py-5 rounded-2xl flex items-center justify-center space-x-3 shadow-[0_10px_20px_-5px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(251,191,36,0.4)] active:scale-95 transition-all group", children: [_jsx(Zap, { className: "w-5 h-5 fill-indigo-950 group-hover:animate-pulse" }), _jsx("span", { className: "text-lg uppercase tracking-widest", children: "Execute Override" })] })] }), _jsx("p", { className: "mt-8 text-indigo-400 text-[10px] text-center font-bold tracking-widest uppercase opacity-40", children: "Unauthorized access is strictly prohibited. Security protocols active." })] })] })] }));
};
export default AdminLoginPage;
