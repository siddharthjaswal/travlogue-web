'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useTrips } from '@/hooks/use-trips';
import { LayoutDashboard, Map, CalendarDays, Wallet, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

function getPageTitle(pathname: string | null) {
    if (!pathname) return 'Dashboard';
    if (pathname.match(/\/dashboard\/trips\/\d+/)) return 'Trip Details';
    if (pathname.startsWith('/dashboard/trips')) return 'My Trips';
    if (pathname.startsWith('/dashboard/calendar')) return 'Calendar';
    if (pathname.startsWith('/dashboard/expenses')) return 'Expenses';
    if (pathname.startsWith('/dashboard/settings')) return 'Settings';
    return 'Dashboard';
}

const mobileNavItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', exact: true },
    { icon: Map, label: 'Trips', href: '/dashboard/trips', exact: false },
    { icon: CalendarDays, label: 'Calendar', href: '/dashboard/calendar', exact: true },
    { icon: Wallet, label: 'Expenses', href: '/dashboard/expenses', exact: true },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', exact: true },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const { data: trips, isLoading } = useTrips();
    const pathname = usePathname();

    const firstName = user?.name?.split(' ')[0] || 'there';
    const pageTitle = getPageTitle(pathname);
    const isTripDetail = pathname?.match(/\/dashboard\/trips\/\d+/);

    const upcomingCount = useMemo(() => {
        if (!trips) return 0;
        const now = Date.now() / 1000;
        return trips.filter((t: any) => (t.startDateTimestamp || 0) >= now).length;
    }, [trips]);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile bottom nav */}
                {!isTripDetail && (
                    <nav className="md:hidden fixed bottom-4 left-0 right-0 z-30 px-4">
                        <div className="mx-auto max-w-md rounded-3xl border border-white/10 glass-dark shadow-xl">
                            <div className="flex items-center justify-around py-3 px-2">
                                {mobileNavItems.map((item) => {
                                    const isActive = item.exact
                                        ? pathname === item.href
                                        : pathname?.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors px-3 py-1',
                                                isActive ? 'text-primary' : 'text-white/40 hover:text-white/70'
                                            )}
                                        >
                                            <div className={cn('relative', isActive && 'after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary')}>
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>
                )}

                {/* Header */}
                <header className="h-16 border-b border-border/30 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-10 flex-shrink-0">
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold text-foreground leading-tight">{pageTitle}</h1>
                        <p className="text-xs text-muted-foreground leading-tight">
                            {pathname === '/dashboard' || pathname === '/dashboard/trips'
                                ? isLoading
                                    ? 'Loading your trips...'
                                    : `${getGreeting()}, ${firstName} · ${upcomingCount > 0 ? `${upcomingCount} upcoming trip${upcomingCount > 1 ? 's' : ''}` : 'No upcoming trips'}`
                                : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                            }
                        </p>
                    </div>

                    {/* Right: date badge */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="px-3 py-1.5 rounded-lg bg-card border border-border/40 font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6 pb-28 md:pb-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
