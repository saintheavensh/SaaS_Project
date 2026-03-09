'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Globe, Shield, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
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

    return (
        <div className="flex flex-col h-full w-64 bg-indigo-950 text-white border-r border-indigo-900">
            <div className="p-6 bg-indigo-900/50">
                <div className="flex items-center space-x-2">
                    <Shield className="w-8 h-8 text-amber-400" />
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
            </div>

            <nav className="flex-1 px-4 mt-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-amber-600/20 text-amber-400 border border-amber-600/30 shadow-[0_0_15px_-3px_rgba(251,191,36,0.2)]"
                                    : "hover:bg-indigo-900 text-indigo-300 hover:text-amber-200"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-amber-400" : "group-hover:text-amber-200")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-indigo-900 bg-indigo-900/20">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-indigo-400 hover:bg-orange-900/20 hover:text-orange-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout Admin</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
