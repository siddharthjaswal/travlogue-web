'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Dashboard Header */}
                <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
                    <h1 className="text-xl font-semibold">Dashboard</h1>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                            <Avatar>
                                <AvatarImage src={user?.picture} />
                                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </div>
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
