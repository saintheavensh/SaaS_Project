'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, ShieldCheck, Globe } from 'lucide-react';

const AdminHeader = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-slate-50 border-b border-indigo-100 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Globe className="w-3 h-3" />
                    <span>Global Network Architecture</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-600">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-medium">System Integrity Verified</span>
                </div>

                <button className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all relative group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-slate-50 group-hover:ring-white"></span>
                </button>

                <div className="h-8 w-px bg-slate-200"></div>

                <div className="flex items-center space-x-4 bg-white p-1.5 pr-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
                        S
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">{user?.name || 'Super Admin'}</p>
                        <p className="text-[10px] text-indigo-500 font-black uppercase">Core System Maintenance</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
