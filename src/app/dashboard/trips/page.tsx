'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTrips } from '@/hooks/use-trips';
import { TripCard } from '@/components/dashboard/trip-card';
import { CreateTripDialog } from '@/components/dashboard/create-trip-dialog';
import { Button } from '@/components/ui/button';
import { Map, Sparkles, Globe, Search } from 'lucide-react';
import { StatsBar } from '@/components/dashboard/stats-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import type { Trip } from '@/services/trip-service';
import { Calendar as CalendarView } from '@/components/ui/calendar';


export default function TripsPage() {
    const { user } = useAuth();
    const { data: trips, isLoading, isError } = useTrips();
    const [query, setQuery] = useState('');

    const filteredTrips = useMemo(() => {
        if (!trips) return [];

        const q = query.trim().toLowerCase();
        const list = trips.filter((trip: Trip) => {
            const haystack = [
                trip.name,
                trip.description,
                trip.primaryDestinationCity,
                trip.primaryDestinationCountry,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesQuery = q.length === 0 || haystack.includes(q);
            return matchesQuery;
        });

        return list.sort((a: Trip, b: Trip) => (a.startDateTimestamp || 0) - (b.startDateTimestamp || 0));
    }, [trips, query]);

    const now = Date.now();
    const upcomingTrips = filteredTrips.filter((trip: Trip) => (trip.startDateTimestamp || 0) * 1000 >= now);
    const nextTrip = upcomingTrips[0];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats bar */}
            {trips && trips.length > 0 && <StatsBar trips={trips} />}

            {/* Search + create row */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search your trips…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="surface-1 w-full h-11 pl-10 pr-4 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                    />
                </div>
                <CreateTripDialog />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col space-y-3"
                        >
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <div className="space-y-3 px-1">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-destructive/5 border-destructive/20">
                    <p className="text-destructive mb-4">Unable to load your trips</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            ) : filteredTrips.length > 0 ? (
                <div className="space-y-8">
                    {/* Upcoming trips */}
                    {upcomingTrips.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Upcoming</h3>
                                <span className="text-xs text-muted-foreground">{upcomingTrips.length} trip{upcomingTrips.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {upcomingTrips.map((trip: Trip, index: number) => (
                                    <TripCard key={trip.id} trip={trip} index={index} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past trips */}
                    {filteredTrips.filter((t: Trip) => (t.startDateTimestamp || 0) * 1000 < Date.now()).length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Past trips</h3>
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredTrips
                                    .filter((t: Trip) => (t.startDateTimestamp || 0) * 1000 < Date.now())
                                    .map((trip: Trip, index: number) => (
                                        <TripCard key={trip.id} trip={trip} index={index} />
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Beautiful empty state
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="flex flex-col items-center justify-center min-h-[500px] border border-dashed rounded-2xl p-12 text-center bg-gradient-to-br from-primary/5 via-accent/5 to-transparent relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6 mx-auto">
                            <Globe className="h-12 w-12 text-primary" strokeWidth={1.5} />
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2 tracking-tight">Your adventure starts here</h3>
                        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                            Create your first trip and start planning an unforgettable journey. 
                            Track destinations, dates, and make your travel dreams a reality.
                        </p>
                        
                        <CreateTripDialog />
                        
                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Planning made effortless</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
