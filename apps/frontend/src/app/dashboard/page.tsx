'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
    const { user } = useAuth();

    const stats = [
        { name: 'Total Products', value: '124', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Active Inventory', value: '3,842', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { name: 'Low Stock Alerts', value: '12', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
        { name: 'Fulfilled Today', value: '48', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    const dummyProducts = [
        { id: '1', name: 'Premium Wireless Headphones', sku: 'WH-1000XM4', stock: 45, price: 349.99 },
        { id: '2', name: 'Mechanical Gaming Keyboard', sku: 'G-PRO-X', stock: 8, price: 149.50 },
        { id: '3', name: 'UltraWide Monitor 34"', sku: 'UW-34-CURVED', stock: 12, price: 899.00 },
        { id: '4', name: 'USB-C Docking Station', sku: 'DOCK-12-IN-1', stock: 154, price: 199.99 },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Morning, {user?.name.split(' ')[0]}</h2>
                        <p className="text-slate-500 text-sm">Here&apos;s what&apos;s happening with your inventory today.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                                    </div>
                                    <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-lg">Inventory Overview</h3>
                            <button className="text-blue-600 text-sm font-semibold hover:underline">View All Products</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dummyProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.sku}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{product.stock}</td>
                                        <td className="px-6 py-4 text-slate-900">${product.price.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {product.stock < 10 ? (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-tighter">Critical Low</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tighter">Healthy</span>
                                            )}
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

export default UserDashboard;
