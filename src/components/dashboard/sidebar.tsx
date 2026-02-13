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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from '@/components/mode-toggle';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Map, label: 'My Trips', href: '/dashboard/trips' },
    { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
    { icon: Wallet, label: 'Expenses', href: '/dashboard/expenses' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    // Get First Name safely
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    return (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 80 : 256 }}
            className={cn(
                "hidden md:flex flex-col h-screen border-r border-border bg-card z-20 flex-shrink-0",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
                {!collapsed && (
                    <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <img src="/ic_travlogue.svg" alt="Travlogue" className="h-6 w-6" />
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent truncate">Travlogue</span>
                    </span>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 mx-auto flex items-center justify-center">
                        <img src="/ic_travlogue.svg" alt="Travlogue" className="h-5 w-5" />
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn("ml-auto h-8 w-8 text-muted-foreground", collapsed && "mx-auto")}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 py-6 flex flex-col gap-2 px-3">
                {/* Create Trip Action */}
                <div className="mb-6">
                    <Button 
                        className={cn(
                            "w-full shadow-sm transition-all", 
                            collapsed ? "px-0" : "justify-start"
                        )} 
                        size={collapsed ? "icon" : "default"}
                    >
                        <PlusCircle className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                        {!collapsed && "New Trip"}
                    </Button>
                </div>

                <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="block">
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full",
                                        collapsed ? "justify-center px-0" : "justify-start px-4",
                                        isActive ? "bg-secondary font-medium" : "text-muted-foreground"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                                    {!collapsed && item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t border-border/50">
                <div className={cn("flex items-center gap-3", collapsed ? "justify-center flex-col" : "")}>
                    <Avatar className={cn("transition-all border border-border", collapsed ? "h-8 w-8" : "h-9 w-9")}>
                        <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
                        <AvatarFallback>{firstName[0]}</AvatarFallback>
                    </Avatar>
                    
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                            <span className="font-medium text-sm truncate">{firstName}</span>
                            <span className="text-[10px] text-muted-foreground truncate">View Profile</span>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("text-muted-foreground hover:text-destructive transition-colors", collapsed ? "h-8 w-8 mt-2" : "h-8 w-8 ml-auto")}
                        onClick={() => logout()}
                        title="Sign Out"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
