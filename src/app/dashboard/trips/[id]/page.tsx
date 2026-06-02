'use client';

import { useTrip } from '@/hooks/use-trips';
import { TripHeader } from '@/components/trips/trip-header';
import { TimelineView } from '@/components/timeline/timeline-view';
import { BudgetView } from '@/components/budget/budget-view';
import { TripSettings } from '@/components/settings/trip-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Map, Wallet, Settings, CloudSun, Plane, CalendarDays } from 'lucide-react';
import { WeatherPanel } from '@/components/trips/weather-panel';
import { FlightSearch } from '@/components/trips/flight-search';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TripDetailsPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: trip, isLoading, isError } = useTrip(id);
    const [sidePanel, setSidePanel] = useState<'weather' | 'flights' | 'calendar'>('weather');

    const tripStartDate = trip?.startDateTimestamp ? new Date(trip.startDateTimestamp * 1000) : new Date();
    const tripEndDate   = trip?.endDateTimestamp   ? new Date(trip.endDateTimestamp   * 1000) : tripStartDate;

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
            <div className="flex items-center gap-2">
                <Link href="/dashboard/trips">
                    <Button variant="ghost" size="sm" className="rounded-full border border-border/40 bg-card/60 backdrop-blur-md px-3 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                </Link>
            </div>

            <TripHeader trip={trip} />

            {/* Main layout: tabs + side panel */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-4">
                {/* Left: tabs — min-w-0 prevents the 1fr cell expanding to fit Leaflet tiles */}
                <div className="min-w-0">
                    <Tabs defaultValue="itinerary">
                        <div className="md:hidden fixed bottom-4 left-0 right-0 z-20 px-4">
                            <div className="mx-auto max-w-md rounded-full border border-border/30 glass-dark shadow-lg">
                                <TabsList className="w-full flex-nowrap justify-around overflow-x-auto py-2 px-2.5 gap-2">
                                    <TabsTrigger value="itinerary" className="text-[11px] flex flex-col items-center gap-1 px-4 py-2 h-11 min-w-[80px] text-muted-foreground data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                                        <Map className="h-5 w-5" />Itinerary
                                    </TabsTrigger>
                                    <TabsTrigger value="budget" className="text-[11px] flex flex-col items-center gap-1 px-4 py-2 h-11 min-w-[80px] text-muted-foreground data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                                        <Wallet className="h-5 w-5" />Expenses
                                    </TabsTrigger>
                                    <TabsTrigger value="settings" className="text-[11px] flex flex-col items-center gap-1 px-4 py-2 h-11 min-w-[80px] text-muted-foreground data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                                        <Settings className="h-5 w-5" />Settings
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>
                        <div className="hidden md:block relative z-10">
                            <TabsList className="flex-nowrap justify-start rounded-2xl border border-border/40 bg-card/50 backdrop-blur-xl p-1 gap-1">
                                <TabsTrigger value="itinerary" className="rounded-xl flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                                    <Map className="h-4 w-4" />Itinerary
                                </TabsTrigger>
                                <TabsTrigger value="budget" className="rounded-xl flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                                    <Wallet className="h-4 w-4" />Budget
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="rounded-xl flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
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

                {/* Right: intelligence side panel */}
                <div className="hidden lg:flex flex-col gap-4">
                    {/* Panel toggle */}
                    <div className="flex gap-1 p-1 rounded-xl bg-card/50 border border-border/40">
                        <button
                            onClick={() => setSidePanel('weather')}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sidePanel === 'weather' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <CloudSun className="h-3.5 w-3.5" />Weather
                        </button>
                        <button
                            onClick={() => setSidePanel('flights')}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sidePanel === 'flights' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Plane className="h-3.5 w-3.5" />Flights
                        </button>
                        <button
                            onClick={() => setSidePanel('calendar')}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sidePanel === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <CalendarDays className="h-3.5 w-3.5" />Calendar
                        </button>
                    </div>

                    {sidePanel === 'weather' && (
                        <WeatherPanel
                            city={trip.primaryDestinationCity}
                            country={trip.primaryDestinationCountry}
                            tripStartTimestamp={trip.startDateTimestamp}
                            tripEndTimestamp={trip.endDateTimestamp}
                        />
                    )}
                    {sidePanel === 'flights' && (
                        <FlightSearch
                            defaultDestination=""
                            compact
                        />
                    )}
                    {sidePanel === 'calendar' && (
                        <div className="liquid-glass rounded-3xl p-3.5">
                            <Calendar
                                mode="range"
                                selected={{ from: tripStartDate, to: tripEndDate }}
                                defaultMonth={tripStartDate}
                                className="w-full bg-transparent border-0 p-0 backdrop-blur-none shadow-none"
                            />
                        </div>
                    )}
                </div>
            </div>
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
