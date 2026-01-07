'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Map, Plus } from 'lucide-react';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.given_name || 'Traveler'}!</h2>
                    <p className="text-muted-foreground">Here's what's happening with your trips.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Trip
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                        <Map className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground pt-1">No upcoming trips planned.</p>
                        <div className="mt-4">
                            <Button variant="outline" size="sm" className="w-full">Plan a Trip</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
