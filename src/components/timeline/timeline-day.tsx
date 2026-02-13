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

function getNextDefaultTime(activities: TripDay['activities']): string {
    const times = activities
        .map(a => a.time)
        .filter(Boolean) as string[];

    if (times.length === 0) return '09:00';

    const last = times.sort().slice(-1)[0];
    const [h, m] = last.split(':').map(Number);
    const nextH = Math.min((h + 1), 23);
    return `${String(nextH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

export function TimelineDay({ day }: TimelineDayProps) {
    const dateObj = new Date(day.date);

    // Format: "JAN, FRI"
    const monthName = format(dateObj, 'MMM').toUpperCase();
    const dayName = format(dateObj, 'EEEE').toUpperCase(); // Full day name

    const nextTime = getNextDefaultTime(day.activities);

    return (
        <div className="relative pl-8 md:pl-0">
            {/* Mobile Timeline Line */}
            <div className="absolute left-[-17px] top-0 bottom-0 w-px bg-border/50 md:hidden" />
            <div className="absolute left-[-21px] top-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background md:hidden" />

            <div className="md:grid md:grid-cols-[140px_1fr] gap-10 mb-16">
                {/* Day Header (Left Column) */}
                <div className="relative mb-6 md:mb-0 pt-1">
                    <div className="md:sticky md:top-32 flex md:justify-end">
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1">
                            <span className="text-4xl md:text-5xl font-bold text-foreground leading-none tracking-tight">
                                {format(dateObj, 'd')}
                            </span>
                            <div className="flex flex-col md:items-end">
                                <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                                    {monthName}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {dayName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Column (Right) */}
                <div className="relative">
                    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md p-6 shadow-sm">
                        {/* Location + Add */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{day.place}</span>
                                </div>
                                <div className="h-px w-20 bg-border/30 hidden md:block" />
                            </div>

                            <AddActivityDialog
                                tripId={day.tripId}
                                initialDate={dateObj}
                                initialTime={nextTime}
                                trigger={
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2 rounded-full"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Add Activity
                                    </Button>
                                }
                            />
                        </div>

                        {/* Activities List */}
                        <div className="space-y-5">
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
                                <div className="group relative border-2 border-dashed border-border/40 hover:border-primary/20 rounded-2xl p-10 text-center bg-muted/5 transition-all hover:bg-muted/10">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <PlusCircle className="h-10 w-10 text-primary/20" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Free day</p>
                                    <p className="text-muted-foreground/60 text-xs mt-1">No activities planned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
