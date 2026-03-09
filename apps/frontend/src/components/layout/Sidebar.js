'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const Sidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuth();
    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];
    return (_jsxs("div", { className: "flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800", children: [_jsx("div", { className: "p-6", children: _jsx("h1", { className: "text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent", children: "SaaS Portal" }) }), _jsx("nav", { className: "flex-1 px-4 space-y-2", children: menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (_jsxs(Link, { href: item.href, className: cn("flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group", isActive
                            ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                            : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"), children: [_jsx(Icon, { className: cn("w-5 h-5", isActive ? "text-blue-400" : "group-hover:text-slate-200") }), _jsx("span", { className: "font-medium", children: item.name })] }, item.name));
                }) }), _jsx("div", { className: "p-4 border-t border-slate-800", children: _jsxs("button", { onClick: logout, className: "flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Logout" })] }) })] }));
};
export default Sidebar;
