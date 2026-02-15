'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useTrips } from '@/hooks/use-trips';
import { LayoutDashboard, Map, CalendarDays, Wallet, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const { data: trips, isLoading } = useTrips();
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Nav (Bottom Glass Bar) */}
                {!pathname?.startsWith('/dashboard/trips/') && (
                <nav className="md:hidden fixed bottom-4 left-0 right-0 z-30 px-4">
                    <div className="mx-auto max-w-md rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-lg">
                        <div className="flex items-center justify-around py-3">
                            <Link href="/dashboard" className={cn("flex flex-col items-center text-[11px] transition-colors", pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground')}>
                                <LayoutDashboard className={cn("h-5 w-5", pathname === '/dashboard' && 'text-primary')} />
                                Overview
                            </Link>
                            <Link href="/dashboard/trips" className={cn("flex flex-col items-center text-[11px] transition-colors", pathname?.startsWith('/dashboard/trips') ? 'text-foreground' : 'text-muted-foreground')}>
                                <Map className={cn("h-5 w-5", pathname?.startsWith('/dashboard/trips') && 'text-primary')} />
                                Trips
                            </Link>
                            <Link href="/dashboard/calendar" className={cn("flex flex-col items-center text-[11px] transition-colors", pathname === '/dashboard/calendar' ? 'text-foreground' : 'text-muted-foreground')}>
                                <CalendarDays className={cn("h-5 w-5", pathname === '/dashboard/calendar' && 'text-primary')} />
                                Calendar
                            </Link>
                            <Link href="/dashboard/expenses" className={cn("flex flex-col items-center text-[11px] transition-colors", pathname === '/dashboard/expenses' ? 'text-foreground' : 'text-muted-foreground')}>
                                <Wallet className={cn("h-5 w-5", pathname === '/dashboard/expenses' && 'text-primary')} />
                                Expenses
                            </Link>
                            <Link href="/dashboard/settings" className={cn("flex flex-col items-center text-[11px] transition-colors", pathname === '/dashboard/settings' ? 'text-foreground' : 'text-muted-foreground')}>
                                <Settings className={cn("h-5 w-5", pathname === '/dashboard/settings' && 'text-primary')} />
                                Settings
                            </Link>
                        </div>
                    </div>
                </nav>
                )}

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
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-auto p-8 pb-28 md:pb-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
