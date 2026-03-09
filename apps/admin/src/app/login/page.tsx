'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            router.push('/dashboard');
        } catch (err) {
            console.error('Admin login failed:', err);
            alert(err instanceof Error ? err.message : 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 mb-6 backdrop-blur-xl">
                        <ShieldCheck className="w-12 h-12 text-amber-400" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic uppercase">System Access</h1>
                    <p className="text-indigo-300 font-medium">ADMINISTRATIVE INTERFACE LEVEL 4</p>
                </div>

                <div className="bg-indigo-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)]">
                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] ml-4">Identifier</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-indigo-950/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono placeholder:text-indigo-700"
                                    placeholder="Root Terminal ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] ml-4">Encryption Logic</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-indigo-950/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono placeholder:text-indigo-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-br from-amber-400 to-orange-500 text-indigo-950 font-black py-5 rounded-2xl flex items-center justify-center space-x-3 shadow-[0_10px_20px_-5px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(251,191,36,0.4)] active:scale-95 transition-all group"
                        >
                            <Zap className="w-5 h-5 fill-indigo-950 group-hover:animate-pulse" />
                            <span className="text-lg uppercase tracking-widest">Execute Override</span>
                        </button>
                    </form>

                    <p className="mt-8 text-indigo-400 text-[10px] text-center font-bold tracking-widest uppercase opacity-40">
                        Unauthorized access is strictly prohibited. Security protocols active.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLoginPage;
