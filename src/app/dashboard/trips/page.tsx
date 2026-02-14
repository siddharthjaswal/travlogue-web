'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTrips } from '@/hooks/use-trips';
import { TripCard } from '@/components/dashboard/trip-card';
import { CreateTripDialog } from '@/components/dashboard/create-trip-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Map, Sparkles, Globe, Search, SlidersHorizontal, Calendar, ArrowUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import type { Trip } from '@/services/trip-service';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Planning', value: 'planning' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

const sortOptions = [
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Recently Added', value: 'recent' },
    { label: 'Name (A–Z)', value: 'name' },
];

export default function TripsPage() {
    const { user } = useAuth();
    const { data: trips, isLoading, isError } = useTrips();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('upcoming');

    const filteredTrips = useMemo(() => {
        if (!trips) return [];

        const q = query.trim().toLowerCase();
        let list = trips.filter((trip: Trip) => {
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
            const matchesStatus = status === 'all' || trip.status === status;
            return matchesQuery && matchesStatus;
        });

        if (sort === 'name') {
            list = list.sort((a: Trip, b: Trip) => a.name.localeCompare(b.name));
        } else if (sort === 'recent') {
            // No createdAt in Trip model; fallback to startDateTimestamp
            list = list.sort((a: Trip, b: Trip) => (b.startDateTimestamp || 0) - (a.startDateTimestamp || 0));
        } else {
            // Upcoming: earliest start date first
            list = list.sort((a: Trip, b: Trip) => (a.startDateTimestamp || 0) - (b.startDateTimestamp || 0));
        }

        return list;
    }, [trips, query, status, sort]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Journeys</h2>
                        <p className="text-muted-foreground mt-1">
                            Your collection of adventures, past and planned
                        </p>
                    </div>
                    <div className="w-full sm:w-auto">
                        <CreateTripDialog />
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by destination, name, or notes..."
                            className="pl-9 h-10"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap w-full">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-full sm:w-[170px] h-10">
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="w-full sm:w-[170px] h-10">
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {query && (
                        <Badge variant="secondary" className="rounded-full px-3">Query: {query}</Badge>
                    )}
                    {status !== 'all' && (
                        <Badge variant="secondary" className="rounded-full px-3 capitalize">Status: {status}</Badge>
                    )}
                    <Badge variant="outline" className="rounded-full px-3">{filteredTrips.length} trips</Badge>
                </div>
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTrips.map((trip: Trip, index: number) => (
                        <TripCard key={trip.id} trip={trip} index={index} />
                    ))}
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
