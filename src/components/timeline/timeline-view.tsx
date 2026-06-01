'use client';

import { useState, useEffect } from 'react';
import { showError } from '@/lib/toast-helper';
import { useTripTimeline, useCreateTripDay, useTrip } from '@/hooks/use-trips';
import { useAccommodationsByTrip } from '@/hooks/use-accommodations';
import { Accommodation } from '@/services/accommodation-service';
import { TimelineDay } from './timeline-day';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Maximize2 } from 'lucide-react';
// Dialog removed — using plain fixed overlay for map to avoid CSS transform conflicts
import { AddActivityDialog } from './add-activity-dialog';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { TripMap } from '@/components/trips/trip-map';

interface TimelineViewProps {
    tripId: number;
    readOnly?: boolean;
}

export function TimelineView({ tripId, readOnly }: TimelineViewProps) {
    const { data: timeline, isLoading, isError } = useTripTimeline(tripId);
    const [mapOpen, setMapOpen] = useState(false);
    const [mapMounted, setMapMounted] = useState(false);
    const [dialogHeight, setDialogHeight] = useState(600);

    // Delay mounting the full-screen map until dialog animation completes, capture real height
    useEffect(() => {
        if (mapOpen) {
            const t = setTimeout(() => {
                // Use actual window height to give Google Maps explicit pixel dimensions
                setDialogHeight(typeof window !== 'undefined' ? window.innerHeight - 48 : 700);
                setMapMounted(true);
            }, 350);
            return () => clearTimeout(t);
        } else {
            setMapMounted(false);
        }
    }, [mapOpen]);
    const { data: trip } = useTrip(tripId);
    const { data: accommodations } = useAccommodationsByTrip(tripId);
    const createTripDay = useCreateTripDay();

    const handleAddDay = async () => {
        try {
            // Determine date: if trip has start date, use that. Else today.
            // If days exist, this empty state wouldn't run, so we just check start date.
            let date = new Date().toISOString().split('T')[0];

            if (trip?.startDateTimestamp) {
                date = new Date(trip.startDateTimestamp * 1000).toISOString().split('T')[0];
            }

            await createTripDay.mutateAsync({
                tripId,
                date: date,
                dayNumber: 1, // Only used when itinerary is empty
                place: trip?.primaryDestinationCity || trip?.primaryDestinationCountry || 'Unknown Location'
            });
            toast.success("Day added successfully");
        } catch (error) {
            showError("Failed to add day", error);
            console.error(error);
        }
    };

    if (isLoading) {
        return <TimelineSkeleton />;
    }

    if (isError) {
        return <div className="text-destructive">Failed to load timeline.</div>;
    }

    if (!timeline || timeline.days.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold">Itinerary is empty</h3>
                <p className="text-muted-foreground mb-4">Start by adding days to your trip.</p>
                <Button onClick={handleAddDay} disabled={createTripDay.isPending}>
                    {createTripDay.isPending ? 'Adding...' : 'Add Day'}
                </Button>
            </div>
        );
    }

    const startDate = trip?.startDateTimestamp
        ? new Date(trip.startDateTimestamp * 1000)
        : timeline.days?.[0]
            ? new Date(timeline.days[0].date)
            : new Date();

    const endDate = trip?.endDateTimestamp
        ? new Date(trip.endDateTimestamp * 1000)
        : timeline.days?.[timeline.days.length - 1]
            ? new Date(timeline.days[timeline.days.length - 1].date)
            : startDate;

    const stayMap = new Map<number, { name: string; nights: number; isStart: boolean; isEnd: boolean; checkInTime?: number | null; checkOutTime?: number | null; accommodations?: Accommodation[] }>();

    const stayByDayName = timeline.days.map((day) => {
        const accForDay = accommodations?.filter(a => a.tripDayId === day.id) || [];
        const stay = accForDay[0];
        return stay ? stay.name : null;
    });

    const stayTimesByDay = timeline.days.map((day) => {
        const accForDay = accommodations?.filter(a => a.tripDayId === day.id) || [];
        const checkIn = accForDay.find(a => a.accommodationType === 'check_in')?.checkInTime ?? null;
        const checkOut = accForDay.find(a => a.accommodationType === 'check_out')?.checkOutTime ?? null;
        return { checkIn, checkOut };
    });

    let i = 0;
    while (i < stayByDayName.length) {
        const name = stayByDayName[i];
        if (!name) { i++; continue; }
        let j = i + 1;
        while (j < stayByDayName.length && stayByDayName[j] === name) j++;
        const nights = Math.max(1, j - i);
        const segmentDayIds = timeline.days.slice(i, j).map(d => d.id);
        const segmentAcc = (accommodations || []).filter(a => segmentDayIds.includes(a.tripDayId) && a.name === name);
        for (let k = i; k < j; k++) {
            stayMap.set(timeline.days[k].id, {
                name,
                nights,
                isStart: k === i,
                isEnd: k === j - 1,
                checkInTime: stayTimesByDay[k]?.checkIn ?? null,
                checkOutTime: stayTimesByDay[k]?.checkOut ?? null,
                accommodations: segmentAcc,
            });
        }
        i = j;
    }

    return (
        <div className="py-4">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
                {/* Left Sidebar: Calendar + Map */}
                <div className="hidden lg:block sticky top-20 space-y-4">
                    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-3">
                        <Calendar
                            mode="range"
                            selected={{ from: startDate, to: endDate }}
                            className="w-full"
                            defaultMonth={startDate}
                        />
                    </div>
                    <div className="relative rounded-2xl overflow-hidden w-full" style={{ height: 240 }}>
                        {trip && <TripMap trip={trip} height={240} className="w-full" />}
                        <div className="absolute left-3 right-3 bottom-3 rounded-2xl border border-border/30 bg-card/70 backdrop-blur px-4 py-3 text-xs text-muted-foreground">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#7FD1C8]" /> Sightseeing
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#F2A477]" /> Dining
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#A8A4F2]" /> Transport
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-0.5 w-5 border-t-2 border-dashed border-[#A8A4F2]" /> Route
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#8FB7FF]" /> Stay
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#C5B8A5]" /> Other
                                </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                                    onClick={() => setMapOpen(true)}
                                    aria-label="Expand map"
                                >
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full-screen map overlay — plain fixed div, no Dialog transforms */}
                {mapOpen && (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0d1117' }}
                        className="flex flex-col"
                    >
                        {/* Header bar */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-card/80 backdrop-blur flex-shrink-0">
                            <span className="text-sm font-semibold text-foreground">
                                {trip?.name} — Map
                            </span>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                                    {[['#7FD1C8','Sightseeing'],['#F2A477','Dining'],['#A8A4F2','Transport'],['#8FB7FF','Stay']].map(([c,l]) => (
                                        <span key={l} className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                                            {l}
                                        </span>
                                    ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                                    onClick={() => setMapOpen(false)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </Button>
                            </div>
                        </div>
                        {/* Map fills remaining height — explicit pixels, no CSS height chains */}
                        <div style={{ flex: 1 }} ref={(el) => {
                            if (el && mapMounted && trip) return;
                            if (el && !mapMounted) {
                                // Set height after layout
                                setTimeout(() => setMapMounted(true), 50);
                            }
                        }}>
                            {mapMounted && trip && (
                                <TripMap
                                    trip={trip}
                                    height={typeof window !== 'undefined' ? window.innerHeight - 52 : 700}
                                    className="w-full"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Right Column: Timeline Stream */}
                <div className="min-h-[400px]">
                    <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-4 shadow-sm">
                        {timeline.days.map((day) => (
                            <div key={day.id} className="relative pb-12 sm:pb-16">
                                <TimelineDay day={day} stayInfo={stayMap.get(day.id)} readOnly={readOnly} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelineSkeleton() {
    return (
        <div className="space-y-8 py-6">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-9 w-24" />
            </div>
            {[1, 2].map((i) => (
                <div key={i} className="md:grid md:grid-cols-[200px_1fr] gap-8">
                    <div className="hidden md:block">
                        <Skeleton className="h-8 w-24 ml-auto mb-2" />
                        <Skeleton className="h-4 w-32 ml-auto" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
