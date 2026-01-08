'use client';

import { TripDay } from '@/services/activity-service';
import { ActivityItem } from './activity-item';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { AddActivityDialog } from './add-activity-dialog';

interface TimelineDayProps {
    day: TripDay;
}

export function TimelineDay({ day }: TimelineDayProps) {
    const dateObj = new Date(day.date);
    const dayLabel = format(dateObj, 'EEE, MMM d');

    return (
        <div className="relative pl-8 md:pl-0">
            {/* Mobile Timeline Line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border md:hidden" />

            <div className="md:grid md:grid-cols-[200px_1fr] gap-8 mb-12">
                {/* Day Header (Left Column on Desktop) */}
                <div className="relative mb-4 md:mb-0">
                    {/* Desktop stickiness or formatting */}
                    <div className="md:sticky md:top-24 text-right pr-6 border-r border-border h-full hidden md:block">
                        <h3 className="text-2xl font-bold text-primary">Day {day.dayNumber}</h3>
                        <p className="text-muted-foreground font-medium mb-1">{dayLabel}</p>
                        <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground/80">
                            <MapPin className="h-3 w-3" />
                            <span>{day.place}</span>
                        </div>
                        <div className="mt-4">
                            <AddActivityDialog
                                tripId={day.tripId}
                                initialDate={dateObj}
                                trigger={
                                    <Button variant="ghost" size="sm" className="w-full justify-end px-0 hover:bg-transparent hover:text-primary">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Activity
                                    </Button>
                                }
                            />
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center gap-4 mb-4">
                        <div className="bg-background border rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm relative z-10">
                            {day.dayNumber}
                        </div>
                        <div>
                            <h3 className="font-bold">{dayLabel}</h3>
                            <p className="text-sm text-muted-foreground">{day.place}</p>
                        </div>
                    </div>
                </div>

                {/* Content Column */}
                <div className="space-y-4">
                    {day.activities.length > 0 ? (
                        day.activities
                            .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                            .map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))
                    ) : (
                        <div className="border border-dashed rounded-lg p-6 text-center bg-muted/10">
                            <p className="text-muted-foreground text-sm italic mb-3">No activities planned yet.</p>
                            <AddActivityDialog
                                tripId={day.tripId}
                                initialDate={dateObj}
                                trigger={
                                    <Button variant="outline" size="sm">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Activity
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
