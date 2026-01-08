'use client';

import { useAuth } from '@/contexts/auth-context';
import { useTrips } from '@/hooks/use-trips';
import { TripCard } from '@/components/dashboard/trip-card';
import { CreateTripDialog } from '@/components/dashboard/create-trip-dialog';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TripsPage() {
    const { user } = useAuth();
    const { data: trips, isLoading, isError } = useTrips();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Trips</h2>
                    <p className="text-muted-foreground">
                        Manage your travel plans and adventures.
                    </p>
                </div>
                {/* Optional: Add Filter/Sort controls here */}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-red-50/10 border-red-200">
                    <p className="text-destructive mb-4">Failed to load trips.</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            ) : trips && trips.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {trips.map((trip, index) => (
                        <TripCard key={trip.id} trip={trip} index={index} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-xl p-8 text-center bg-muted/20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                        <Map className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Your travel journal is empty. Create your first trip to start planning dates, destinations, and budgets.
                    </p>
                    <CreateTripDialog />
                </div>
            )}
        </div>
    );
}
