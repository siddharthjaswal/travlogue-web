'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Map,
    Calendar,
    Wallet,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { motion } from 'framer-motion';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Map, label: 'My Trips', href: '/dashboard/trips' },
    { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
    { icon: Wallet, label: 'Expenses', href: '/dashboard/expenses' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.div
            animate={{ width: collapsed ? 80 : 250 }}
            className="hidden md:flex flex-col h-screen border-r border-border bg-card z-20"
        >
            <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
                {!collapsed && (
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent truncate">
                        Travlogue
                    </span>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 mx-auto" />
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 py-6 flex flex-col gap-2 px-3">
                {/* Create Trip Action */}
                <div className="mb-6">
                    <Button className={cn("w-full shadow-md", collapsed ? "px-2" : "")} size={collapsed ? "icon" : "default"}>
                        <PlusCircle className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                        {!collapsed && "New Trip"}
                    </Button>
                </div>

                <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start",
                                        isActive ? "bg-secondary text-secondary-foreground" : "nav-item",
                                        collapsed ? "justify-center px-2" : ""
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                                    {!collapsed && item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border/50">
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10", collapsed ? "justify-center px-2" : "")}
                    onClick={() => logout()}
                >
                    <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                    {!collapsed && "Sign Out"}
                </Button>
            </div>
        </motion.div>
    );
}
