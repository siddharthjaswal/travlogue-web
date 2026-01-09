'use client';

import { TripDay } from '@/services/activity-service';
import { ActivityItem } from './activity-item';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { AddActivityDialog } from './add-activity-dialog';

interface TimelineDayProps {
    day: TripDay;
}

export function TimelineDay({ day }: TimelineDayProps) {
    const dateObj = new Date(day.date);

    // Format: "JAN, FRI"
    const monthName = format(dateObj, 'MMM').toUpperCase();
    const dayName = format(dateObj, 'EEE').toUpperCase();

    return (
        <div className="relative pl-8 md:pl-0">
            {/* Mobile Timeline Line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border md:hidden" />

            <div className="md:grid md:grid-cols-[200px_1fr] gap-8 mb-12">
                {/* Day Header (Left Column) */}
                <div className="relative mb-4 md:mb-0 pt-2">
                    <div className="md:sticky md:top-24 flex md:justify-end pr-6">
                        <div className="flex items-center gap-3 md:flex-row-reverse">
                            {/* Circle Day Number */}
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center text-xl font-bold text-blue-700 dark:text-blue-200">
                                {format(dateObj, 'd')}
                            </div>

                            {/* Month/Day Label */}
                            <div className="text-right flex flex-col justify-center">
                                <span className="text-sm font-bold text-muted-foreground tracking-wide">
                                    {monthName}, {dayName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Column (Right) */}
                <div className="relative">
                    {/* Base Location Header */}
                    <div className="flex items-center gap-2 mb-6 text-sm font-medium text-muted-foreground/80 bg-muted/30 w-fit px-3 py-1.5 rounded-full">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{day.place}</span>
                    </div>

                    {/* Activities List */}
                    <div className="pt-2">
                        {day.activities.length > 0 ? (
                            day.activities
                                .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                                .map((activity) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        tripId={day.tripId}
                                        date={dateObj}
                                    />
                                ))
                        ) : (
                            <div className="border border-dashed rounded-lg p-8 text-center bg-muted/5 mb-4">
                                <p className="text-muted-foreground text-sm italic">No activities planned for this day yet.</p>
                            </div>
                        )}

                        {/* Add Activity Button - At the bottom */}
                        <div className="mt-4 flex justify-start pl-[100px]">
                            {/* Indent to align with content column of items roughly? Or just left aligned?
                               ActivityItem grid is [60px 40px 1fr]. So 100px indent aligns with content.
                           */}
                            <AddActivityDialog
                                tripId={day.tripId}
                                initialDate={dateObj}
                                trigger={
                                    <Button variant="ghost" className="text-muted-foreground hover:text-primary pl-0 hover:bg-transparent group">
                                        <div className="h-8 w-8 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center mr-2 group-hover:border-primary group-hover:bg-primary/10">
                                            <PlusCircle className="h-4 w-4" />
                                        </div>
                                        Add Activity
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
