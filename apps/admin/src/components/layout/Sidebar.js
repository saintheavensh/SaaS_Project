'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Globe, Shield, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const AdminSidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuth();
    const menuItems = [
        { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Tenants', href: '/tenants', icon: Globe },
        { name: 'System Users', href: '/users', icon: Users },
        { name: 'Global Settings', href: '/settings', icon: Settings },
    ];
    return (_jsxs("div", { className: "flex flex-col h-full w-64 bg-indigo-950 text-white border-r border-indigo-900", children: [_jsx("div", { className: "p-6 bg-indigo-900/50", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "w-8 h-8 text-amber-400" }), _jsx("h1", { className: "text-2xl font-bold", children: "Admin Panel" })] }) }), _jsx("nav", { className: "flex-1 px-4 mt-6 space-y-2", children: menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (_jsxs(Link, { href: item.href, className: cn("flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group", isActive
                            ? "bg-amber-600/20 text-amber-400 border border-amber-600/30 shadow-[0_0_15px_-3px_rgba(251,191,36,0.2)]"
                            : "hover:bg-indigo-900 text-indigo-300 hover:text-amber-200"), children: [_jsx(Icon, { className: cn("w-5 h-5", isActive ? "text-amber-400" : "group-hover:text-amber-200") }), _jsx("span", { className: "font-medium", children: item.name })] }, item.name));
                }) }), _jsx("div", { className: "p-4 border-t border-indigo-900 bg-indigo-900/20", children: _jsxs("button", { onClick: logout, className: "flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-indigo-400 hover:bg-orange-900/20 hover:text-orange-400 transition-colors", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Logout Admin" })] }) })] }));
};
export default AdminSidebar;
