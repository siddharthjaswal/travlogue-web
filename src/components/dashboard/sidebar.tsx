'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateTripDialog } from '@/components/dashboard/create-trip-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

    const firstName = user?.name ? user.name.split(' ')[0] : 'You';

    return (
        <TooltipProvider delayDuration={0}>
            <motion.div
                initial={false}
                animate={{ width: collapsed ? 76 : 240 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="hidden md:flex flex-col h-screen border-r border-border/40 bg-sidebar z-20 flex-shrink-0 overflow-hidden"
            >
                {/* Logo header */}
                <div className="h-16 flex items-center px-4 border-b border-border/30 flex-shrink-0">
                    {collapsed ? (
                        <div className="mx-auto w-8 h-8 flex items-center justify-center">
                            <Image src="/ic_travlogue.svg" alt="Travlogue" width={28} height={28} className="invert opacity-80" />
                        </div>
                    ) : (
                        <Link href="/" className="flex items-center gap-2.5 group flex-1 min-w-0">
                            <Image src="/ic_travlogue.svg" alt="Travlogue" width={26} height={26} className="invert opacity-80 flex-shrink-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-lg font-bold tracking-tight text-foreground truncate">Travlogue</span>
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0 ml-auto"
                    >
                        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                    </Button>
                </div>

                {/* Nav body */}
                <div className="flex-1 flex flex-col gap-1 py-4 px-3 overflow-y-auto overflow-x-hidden">
                    {/* New Trip button */}
                    <div className="mb-3">
                        {collapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CreateTripDialog triggerContent={
                                        <Button size="icon" className="w-full h-10 bg-gradient-to-r from-primary to-teal-400 hover:opacity-90 shadow-lg shadow-primary/20">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    } />
                                </TooltipTrigger>
                                <TooltipContent side="right">New Trip</TooltipContent>
                            </Tooltip>
                        ) : (
                            <CreateTripDialog triggerContent={
                                <Button className="w-full justify-start gap-2.5 bg-gradient-to-r from-primary to-teal-400 hover:opacity-90 shadow-lg shadow-primary/20 font-semibold">
                                    <Plus className="h-4 w-4" />
                                    New Trip
                                </Button>
                            } />
                        )}
                    </div>

                    {/* Nav items */}
                    <nav className="space-y-0.5">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                            const navItem = (
                                <Link key={item.href} href={item.href} className="block">
                                    <div className={cn(
                                        'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
                                        isActive
                                            ? 'bg-primary/12 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
                                        collapsed ? 'justify-center px-0' : ''
                                    )}>
                                        <item.icon className={cn(
                                            'flex-shrink-0 transition-colors',
                                            collapsed ? 'h-5 w-5' : 'h-4.5 w-4.5 mr-3',
                                            isActive ? 'text-primary' : 'group-hover:text-foreground'
                                        )} />
                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                        {isActive && !collapsed && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </Link>
                            );

                            return collapsed ? (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                                    <TooltipContent side="right">{item.label}</TooltipContent>
                                </Tooltip>
                            ) : navItem;
                        })}
                    </nav>
                </div>

                {/* Profile footer */}
                <div className="px-3 py-4 border-t border-border/30 flex-shrink-0">
                    <div className={cn('flex items-center gap-3', collapsed ? 'flex-col' : '')}>
                        <Avatar className="h-8 w-8 ring-2 ring-border flex-shrink-0">
                            <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
                            <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                                {firstName[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground truncate">{user?.name || firstName}</div>
                                <div className="text-xs text-muted-foreground truncate">{user?.email || ''}</div>
                            </div>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side={collapsed ? 'right' : 'top'}>Sign out</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </motion.div>
        </TooltipProvider>
    );
}
