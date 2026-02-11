'use client';

import { useTrip } from '@/hooks/use-trips';
import { TripHeader } from '@/components/trips/trip-header';
import { TripOverview } from '@/components/trips/trip-overview';
import { TimelineView } from '@/components/timeline/timeline-view';
import { BudgetView } from '@/components/budget/budget-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TripDetailsPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: trip, isLoading, isError } = useTrip(id);

    if (isLoading) {
        return <TripDetailsSkeleton />;
    }

    if (isError || !trip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <h2 className="text-2xl font-bold mb-2">Trip not found</h2>
                <p className="text-muted-foreground mb-4">The trip you are looking for does not exist or you don't have permission to view it.</p>
                <Link href="/dashboard/trips">
                    <Button>Back to Trips</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/dashboard/trips">
                    <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Trips
                    </Button>
                </Link>
            </div>

            <TripHeader trip={trip} />

            <Tabs defaultValue="overview" className="mt-8">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                    <TabsTrigger value="budget">Expenses & Budget</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <TripOverview trip={trip} />
                </TabsContent>

                <TabsContent value="itinerary">
                    <TimelineView tripId={id} />
                </TabsContent>

                <TabsContent value="budget">
                    <BudgetView tripId={id} trip={trip} />
                </TabsContent>

                <TabsContent value="settings">
                    <div className="flex items-center justify-center min-h-[300px] border border-dashed rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">Trip settings coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TripDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="h-32 bg-card rounded-xl border p-6 -mt-12 relative z-10 w-full md:w-[400px] mx-6">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="mt-8">
                <Skeleton className="h-10 w-full md:w-[400px]" />
                <div className="mt-4 grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-48 col-span-2" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        </div>
    );
}
