'use client';

import { showError } from '@/lib/toast-helper';
import { useTripTimeline, useCreateTripDay, useTrip } from '@/hooks/use-trips';
import { TimelineDay } from './timeline-day';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddActivityDialog } from './add-activity-dialog';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';

interface TimelineViewProps {
    tripId: number;
}

export function TimelineView({ tripId }: TimelineViewProps) {
    const { data: timeline, isLoading, isError } = useTripTimeline(tripId);
    const { data: trip } = useTrip(tripId);
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

    // Extract dates for Calendar highlighting
    const tripDates = timeline.days
        .map(day => new Date(day.date))
        .filter(date => !isNaN(date.getTime()));
        
    const startDate = tripDates.length > 0 ? tripDates[0] : new Date();

    return (
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight mb-2">Itinerary</h2>
                    <p className="text-muted-foreground text-lg">Your trip schedule at a glance.</p>
                </div>
                <AddActivityDialog tripId={tripId} trigger={
                    <Button size="icon" className="shadow-sm" title="Add Activity">
                        <Plus className="h-5 w-5" />
                    </Button>
                } />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 items-start">
                {/* Left Sidebar: Sticky Calendar */}
                <div className="hidden lg:block sticky top-24">
                    <div className="rounded-3xl bg-transparent p-4">
                        <Calendar
                            mode="multiple"
                            selected={tripDates}
                            className="w-full flex justify-center"
                            defaultMonth={startDate}
                            modifiersStyles={{
                                today: {
                                    fontWeight: '700'
                                }
                            }}
                            classNames={{
                                root: "p-4",
                                months: "flex gap-8 flex-col relative",
                                head_cell: "text-muted-foreground/60 font-medium text-xs w-10 h-10 tracking-wider",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                                day: "h-10 w-10 p-0 font-medium text-foreground/80 aria-selected:opacity-100 hover:bg-muted/50 rounded-lg transition-all duration-200",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md shadow-primary/20",
                                day_today: "bg-transparent text-primary ring-1 ring-primary/30 font-bold",
                                day_outside: "text-muted-foreground/20 opacity-30",
                                day_disabled: "text-muted-foreground/20 opacity-30",
                                day_hidden: "invisible",
                                nav_button: "border-0 hover:bg-muted/50 text-foreground/60 hover:text-foreground transition-colors",
                                caption: "flex justify-center pt-2 relative items-center text-foreground font-bold text-lg mb-8 tracking-tight",
                                weeks: "space-y-3",
                            }}
                        />
                    </div>
                </div>

                {/* Right Column: Timeline Stream */}
                <div className="space-y-0 relative border-l-2 border-border/30 ml-4 lg:ml-0 pl-10 lg:pl-12 lg:border-l-2 min-h-[500px]">
                    {timeline.days.map((day) => (
                        <div key={day.id} className="relative pb-16">
                            <TimelineDay day={day} />
                        </div>
                    ))}
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
