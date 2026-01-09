'use client';

import { useTripTimeline } from '@/hooks/use-trips';
import { TimelineDay } from './timeline-day';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddActivityDialog } from './add-activity-dialog';

interface TimelineViewProps {
    tripId: number;
}

export function TimelineView({ tripId }: TimelineViewProps) {
    const { data: timeline, isLoading, isError } = useTripTimeline(tripId);

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
                <Button>Add Day</Button>
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
                    <Button size="lg" className="shadow-sm">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Activity
                    </Button>
                } />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-16 items-start">
                {/* Left Sidebar: Sticky Calendar */}
                <div className="hidden lg:block sticky top-24">
                    <div className="rounded-[2rem] bg-[#0B1121] dark:bg-[#0B1121] text-slate-100 shadow-xl p-8 overflow-hidden">
                        <Calendar
                            mode="multiple"
                            selected={tripDates}
                            className="w-full flex justify-center p-0"
                            defaultMonth={startDate}
                            modifiersStyles={{
                                selected: {
                                    backgroundColor: '#3b82f6', // blue-500
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '8px'
                                },
                                today: {
                                    color: '#3b82f6',
                                    fontWeight: 'bold'
                                }
                            }}
                            classNames={{
                                head_cell: "text-slate-400 font-normal text-[0.8rem]",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-800 rounded-full",
                                day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white",
                                day_today: "bg-transparent text-blue-500",
                                day_outside: "text-slate-700 opacity-50",
                                day_disabled: "text-slate-700 opacity-50",
                                day_hidden: "invisible",
                                nav_button: "border-slate-700 hover:bg-slate-800 hover:text-slate-50",
                                caption: "flex justify-center pt-1 relative items-center text-slate-50 font-medium",
                            }}
                        />
                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <h4 className="font-semibold text-slate-50 mb-1">Trip Dates</h4>
                            <p className="text-sm text-slate-400">
                                {timeline.days.length} days planned
                            </p>
                        </div>
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

// Need to import Calendar
import { Calendar } from '@/components/ui/calendar';

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
