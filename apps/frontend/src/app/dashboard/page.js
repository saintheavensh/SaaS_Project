'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "flex h-screen bg-slate-50", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, {}), _jsxs("main", { className: "flex-1 overflow-y-auto p-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-slate-900", children: ["Morning, ", user === null || user === void 0 ? void 0 : user.name.split(' ')[0]] }), _jsx("p", { className: "text-slate-500 text-sm", children: "Here's what's happening with your inventory today." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: stats.map((stat, idx) => {
                                    const Icon = stat.icon;
                                    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 }, className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: `p-3 rounded-xl ${stat.bg} ${stat.color}`, children: _jsx(Icon, { className: "w-6 h-6" }) }), _jsx("span", { className: "text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full", children: "+12%" })] }), _jsx("h3", { className: "text-slate-500 text-sm font-medium", children: stat.name }), _jsx("p", { className: "text-2xl font-bold text-slate-900 mt-1", children: stat.value })] }, stat.name));
                                }) }), _jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-slate-100 flex items-center justify-between", children: [_jsx("h3", { className: "font-bold text-slate-900 text-lg", children: "Inventory Overview" }), _jsx("button", { className: "text-blue-600 text-sm font-semibold hover:underline", children: "View All Products" })] }), _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Product Name" }), _jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider", children: "SKU" }), _jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Stock Level" }), _jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Price" }), _jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: dummyProducts.map((product) => (_jsxs("tr", { className: "hover:bg-slate-50 transition-colors group", children: [_jsx("td", { className: "px-6 py-4 font-medium text-slate-900", children: product.name }), _jsx("td", { className: "px-6 py-4 text-slate-500 font-mono text-xs", children: product.sku }), _jsx("td", { className: "px-6 py-4 font-bold text-slate-900", children: product.stock }), _jsxs("td", { className: "px-6 py-4 text-slate-900", children: ["$", product.price.toLocaleString()] }), _jsx("td", { className: "px-6 py-4", children: product.stock < 10 ? (_jsx("span", { className: "px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-tighter", children: "Critical Low" })) : (_jsx("span", { className: "px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tighter", children: "Healthy" })) })] }, product.id))) })] })] })] })] })] }));
};
export default UserDashboard;
