'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/Header';
import { Globe, Users, CreditCard, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {

    const adminStats = [
        { name: 'Active Tenants', value: '2,842', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { name: 'Total Users', value: '45,921', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
        { name: 'MRR Growth', value: '$842.5k', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { name: 'System Uptime', value: '99.99%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    ];

    const dummyTenants = [
        { id: '1', name: 'Global Tech Corp', slug: 'global-tech', plan: 'Enterprise', status: 'Active', users: 450 },
        { id: '2', name: 'Indie Studio', slug: 'indie-studio', plan: 'Pro', status: 'Trial', users: 12 },
        { id: '3', name: 'Mega Retailers', slug: 'mega-retail', plan: 'Enterprise', status: 'Active', users: 1205 },
        { id: '4', name: 'Micro Solutions', slug: 'micro-sol', plan: 'Free', status: 'Suspended', users: 2 },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
                            <p className="text-slate-500 font-medium">Administrative control panel for global SaaS state.</p>
                        </div>
                        <div className="flex space-x-3">
                            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center shadow-sm">
                                Export Logs
                            </button>
                            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200">
                                New Tenant Instance
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        {adminStats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                                        <Icon className="w-16 h-16" />
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.1em]">{stat.name}</h3>
                                    <div className="flex items-baseline space-x-2 mt-2">
                                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                                        <span className="text-emerald-500 text-xs font-bold flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                            4.2%
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase italic">Active Tenant Registry</h3>
                            <div className="flex space-x-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tenant Entity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Instance Slug</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Plan Vector</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Load</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {dummyTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-indigo-50/30 transition-all cursor-pointer">
                                        <td className="px-8 py-6 font-bold text-slate-800">{tenant.name}</td>
                                        <td className="px-8 py-6 text-indigo-400 font-mono text-sm">{tenant.slug}.saas.com</td>
                                        <td className="px-8 py-6 font-medium text-slate-600">{tenant.plan}</td>
                                        <td className="px-8 py-6 font-black text-slate-900">{tenant.users.toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <span className={`w-2 h-2 rounded-full ${tenant.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    tenant.status === 'Trial' ? 'bg-amber-400' : 'bg-red-500'
                                                    }`}></span>
                                                <span className="text-xs font-bold text-slate-700">{tenant.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
