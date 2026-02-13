'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/contexts/auth-context';
import { useTrips } from '@/hooks/use-trips';
import { LayoutDashboard, Map, CalendarDays, Wallet, Settings } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const { data: trips, isLoading } = useTrips();

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Nav */}
                <nav className="md:hidden flex items-center justify-around py-3 border-b border-border/50 bg-background/90 backdrop-blur-md">
                    <Link href="/dashboard" className="flex flex-col items-center text-xs text-muted-foreground hover:text-foreground">
                        <LayoutDashboard className="h-5 w-5" />
                        Overview
                    </Link>
                    <Link href="/dashboard/trips" className="flex flex-col items-center text-xs text-muted-foreground hover:text-foreground">
                        <Map className="h-5 w-5" />
                        Trips
                    </Link>
                    <Link href="/dashboard/calendar" className="flex flex-col items-center text-xs text-muted-foreground hover:text-foreground">
                        <CalendarDays className="h-5 w-5" />
                        Calendar
                    </Link>
                    <Link href="/dashboard/expenses" className="flex flex-col items-center text-xs text-muted-foreground hover:text-foreground">
                        <Wallet className="h-5 w-5" />
                        Expenses
                    </Link>
                    <Link href="/dashboard/settings" className="flex flex-col items-center text-xs text-muted-foreground hover:text-foreground">
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </nav>

                {/* Dashboard Header */}
                <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            {isLoading
                                ? "Loading..."
                                : trips?.length
                                    ? `You have ${trips.length} upcoming adventures`
                                    : "Start planning your next adventure"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
