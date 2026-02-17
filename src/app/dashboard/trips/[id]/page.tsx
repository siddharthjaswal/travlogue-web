'use client';

import { useTrip } from '@/hooks/use-trips';
import { TripHeader } from '@/components/trips/trip-header';
import { TimelineView } from '@/components/timeline/timeline-view';
import { BudgetView } from '@/components/budget/budget-view';
import { TripSettings } from '@/components/settings/trip-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Map, Wallet, Settings } from 'lucide-react';
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
                    <Button variant="ghost" size="sm" className="rounded-full border border-border/40 bg-card/60 backdrop-blur-md px-3 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Trips
                    </Button>
                </Link>
            </div>

            <TripHeader trip={trip} />

            <Tabs defaultValue="itinerary" className="mt-10">
                <div className="md:hidden fixed bottom-4 left-0 right-0 z-20 px-4">
                    <div className="mx-auto max-w-md rounded-full border border-border/30 bg-muted/60 backdrop-blur-xl shadow-lg">
                        <TabsList className="w-full flex-nowrap justify-around overflow-x-auto py-2 px-2.5 gap-2">
                            <TabsTrigger value="itinerary" className="text-[11px] flex flex-col items-center justify-center gap-1 px-4 py-2 h-11 min-w-[96px] leading-none text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                                <Map className="h-5 w-5" />
                                Itinerary
                            </TabsTrigger>
                            <TabsTrigger value="budget" className="text-[11px] flex flex-col items-center justify-center gap-1 px-4 py-2 h-11 min-w-[96px] leading-none text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                                <Wallet className="h-5 w-5" />
                                Expenses
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="text-[11px] flex flex-col items-center justify-center gap-1 px-4 py-2 h-11 min-w-[96px] leading-none text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                                <Settings className="h-5 w-5" />
                                Settings
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>
                <div className="hidden md:block mt-6 relative z-10">
                    <TabsList className="w-full overflow-x-auto flex-nowrap justify-start rounded-3xl border border-border/40 bg-card/70 backdrop-blur-xl p-1.5 shadow-lg gap-1">
                        <TabsTrigger value="itinerary" className="rounded-full flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <Map className="h-4 w-4" />Itinerary
                        </TabsTrigger>
                        <TabsTrigger value="budget" className="rounded-full flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <Wallet className="h-4 w-4" />Expenses & Budget
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-full flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <Settings className="h-4 w-4" />Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="itinerary">
                    <TimelineView tripId={id} />
                </TabsContent>

                <TabsContent value="budget">
                    <BudgetView tripId={id} trip={trip} />
                </TabsContent>

                <TabsContent value="settings">
                    <TripSettings tripId={id} trip={trip} />
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
