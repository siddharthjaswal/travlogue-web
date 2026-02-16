'use client';

import { showError } from '@/lib/toast-helper';
import { useTripTimeline, useCreateTripDay, useTrip } from '@/hooks/use-trips';
import { useAccommodationsByTrip } from '@/hooks/use-accommodations';
import { Accommodation } from '@/services/accommodation-service';
import { TimelineDay } from './timeline-day';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddActivityDialog } from './add-activity-dialog';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { TripMap } from '@/components/trips/trip-map';

interface TimelineViewProps {
    tripId: number;
}

export function TimelineView({ tripId }: TimelineViewProps) {
    const { data: timeline, isLoading, isError } = useTripTimeline(tripId);
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
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-12">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Itinerary</h2>
                    <p className="text-muted-foreground text-base sm:text-lg">Your trip schedule at a glance.</p>
                </div>
                <AddActivityDialog tripId={tripId} trigger={
                    <Button className="w-full sm:w-auto shadow-sm gap-2" title="Add Activity">
                        <Plus className="h-5 w-5" />
                        Add
                    </Button>
                } />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-16 items-start">
                {/* Left Sidebar: Calendar + Map */}
                <div className="hidden lg:block sticky top-24 space-y-6">
                    <div className="rounded-3xl bg-transparent p-0">
                        <Calendar
                            mode="range"
                            selected={{ from: startDate, to: endDate }}
                            className="w-full flex justify-center"
                            defaultMonth={startDate}
                        />
                    </div>
                    <div className="relative rounded-3xl overflow-hidden w-full aspect-square">
                        {trip && <TripMap trip={trip} height={0} className="h-full w-full" />}
                        <div className="absolute left-3 right-3 bottom-3 rounded-2xl border border-border/30 bg-card/70 backdrop-blur px-4 py-3 text-xs text-muted-foreground">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#8FA6C8]" /> Sightseeing
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#C8A38C]" /> Dining
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#7C97C9]" /> Transport
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#A5BBD6]" /> Stay
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full border border-[#5F6E84] bg-[#9AA8BC]" /> Other
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline Stream */}
                <div className="relative pl-0 lg:pl-8 min-h-[400px]">
                    <div className="rounded-3xl border border-border/30 bg-card/30 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
                        {timeline.days.map((day) => (
                            <div key={day.id} className="relative pb-12 sm:pb-16">
                                <TimelineDay day={day} stayInfo={stayMap.get(day.id)} />
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
