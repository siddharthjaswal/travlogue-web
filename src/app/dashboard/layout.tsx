'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/contexts/auth-context';
import { useTrips } from '@/hooks/use-trips';

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
                {/* Dashboard Header */}
                <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
                    <div>
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                        <p className="text-xs text-muted-foreground">
                            {isLoading
                                ? "Loading..."
                                : trips?.length
                                    ? `You have ${trips.length} trips planned`
                                    : "No trips planned yet"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
