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
    const tripDates = timeline.days.map(day => new Date(day.date));
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
                    <div className="rounded-[2rem] bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl overflow-hidden p-12">
                        <Calendar
                            mode="multiple"
                            selected={tripDates}
                            className="w-full flex justify-center"
                            defaultMonth={startDate}
                            modifiersStyles={{
                                selected: {
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                                    color: '#93c5fd',
                                    fontWeight: '500',
                                    borderRadius: '12px',
                                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(59, 130, 246, 0.1)'
                                },
                                today: {
                                    color: '#60a5fa',
                                    fontWeight: '600'
                                }
                            }}
                            classNames={{
                                root: "p-16",
                                months: "flex gap-4 flex-col md:flex-row relative",
                                head_cell: "text-slate-500 dark:text-slate-400 font-normal text-sm w-12",
                                cell: "text-center text-sm p-2 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                                day: "h-11 w-11 p-0 font-normal text-slate-700 dark:text-slate-300 aria-selected:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200",
                                day_selected: "bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-300 hover:from-blue-500/25 hover:to-indigo-500/25 hover:text-blue-700 dark:hover:text-blue-200 focus:from-blue-500/20 focus:to-indigo-500/20 focus:text-blue-600 dark:focus:text-blue-200 ring-1 ring-blue-400/25 shadow-lg shadow-blue-500/10",
                                day_today: "bg-transparent text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30 font-semibold",
                                day_outside: "text-slate-400 dark:text-slate-700 opacity-50",
                                day_disabled: "text-slate-400 dark:text-slate-700 opacity-50",
                                day_hidden: "invisible",
                                nav_button: "border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50",
                                caption: "flex justify-center pt-6 relative items-center text-slate-900 dark:text-slate-50 font-medium mb-4",
                                weeks: "space-y-3",
                            }}
                        />
                    </div>
                </div>

                {/* Right Column: Timeline Stream */}
                <div className="space-y-0 relative border-l border-border/50 ml-4 lg:ml-0 pl-8 lg:pl-0 lg:border-l-0 min-h-[500px]">
                    {timeline.days.map((day) => (
                        <div key={day.id} className="relative pb-4">
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
