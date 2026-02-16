'use client';

import { TripDay } from '@/services/activity-service';
import { ActivityItem } from './activity-item';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { AddActivityDialog } from './add-activity-dialog';
import { useTransits } from '@/hooks/use-transits';

interface StayInfo {
    name: string;
    nights: number;
    isStart: boolean;
    isEnd: boolean;
    checkInTime?: number | null;
    checkOutTime?: number | null;
}

interface TimelineDayProps {
    day: TripDay;
    stayInfo?: StayInfo;
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

export function TimelineDay({ day, stayInfo }: TimelineDayProps) {
    const dateObj = new Date(day.date);

    // Format: "JAN, FRI"
    const monthName = format(dateObj, 'MMM').toUpperCase();
    const dayName = format(dateObj, 'EEEE').toUpperCase(); // Full day name

    const nextTime = getNextDefaultTime(day.activities);
    const { data: transits } = useTransits(day.id);

    return (
        <div className="relative pl-8 md:pl-0">
            {/* Mobile Timeline Line */}
            <div className="absolute left-[-17px] top-0 bottom-0 w-px bg-border/50 md:hidden" />
            <div className="absolute left-[-21px] top-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background md:hidden" />

            <div className="md:grid md:grid-cols-[110px_1fr] gap-8 sm:gap-10 mb-12 sm:mb-16">
                {/* Day Header (Left Column) */}
                <div className="relative mb-6 md:mb-0 pt-1">
                    <div className="md:sticky md:top-32 flex md:justify-start">
                        <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1">
                            <span className="text-4xl md:text-5xl font-bold text-foreground leading-none tracking-tight">
                                {format(dateObj, 'd')}
                            </span>
                            <div className="flex flex-col md:items-start">
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
                    <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-shadow">
                        {stayInfo && stayInfo.isStart && (
                            <div className="mb-4 rounded-full border border-border/30 bg-muted/40 px-4 py-2 text-sm font-medium text-foreground/90 shadow-sm">
                                Stay • {stayInfo.name} • {stayInfo.nights} night{stayInfo.nights === 1 ? '' : 's'}
                                {stayInfo.checkInTime && (
                                    <span className="ml-2 text-xs text-muted-foreground">• Check-in {new Date(stayInfo.checkInTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                            </div>
                        )}
                        {stayInfo && !stayInfo.isStart && (
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                                Continuing stay • {stayInfo.name}
                                {stayInfo.checkOutTime && (
                                    <span>• Check-out {new Date(stayInfo.checkOutTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                            </div>
                        )}

                        {/* Add */}
                        <div className="flex items-center justify-end mb-6">
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
                                        Add
                                    </Button>
                                }
                            />
                        </div>

                        {/* Transits */}
                        {transits && transits.length > 0 && (
                            <div className="mb-6">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Transport</div>
                                <div className="space-y-3">
                                    {transits.map((t) => (
                                        <div key={t.id} className="rounded-xl border border-border/40 bg-muted/20 p-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium capitalize">{t.transitMode}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t.departureTime && t.departureTimezone
                                                        ? new Intl.DateTimeFormat('en-US', { timeZone: t.departureTimezone, hour: '2-digit', minute: '2-digit' }).format(new Date(t.departureTime * 1000))
                                                        : t.departureTime ? new Date(t.departureTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    {t.arrivalTime ? ' → ' : ''}
                                                    {t.arrivalTime && t.arrivalTimezone
                                                        ? new Intl.DateTimeFormat('en-US', { timeZone: t.arrivalTimezone, hour: '2-digit', minute: '2-digit' }).format(new Date(t.arrivalTime * 1000))
                                                        : t.arrivalTime ? new Date(t.arrivalTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {t.fromLocation} {t.toLocation ? `→ ${t.toLocation}` : ''}
                                            </div>
                                            {t.carrier && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {t.carrier} {t.flightNumber ? `• ${t.flightNumber}` : ''}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activities List */}
                        <div className="space-y-5">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activities</div>
                            {day.activities.length > 0 ? (
                                day.activities
                                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                                    .map((activity) => (
                                        <ActivityItem
                                            key={activity.id}
                                            activity={activity}
                                            tripId={day.tripId}
                                            date={dateObj}
                                            dayPlace={day.place}
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

                        {/* City Labels */}
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {day.place
                                .split('→')
                                .map((p) => p.trim())
                                .filter(Boolean)
                                .map((place, idx) => (
                                    <div key={`${place}-${idx}`} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{place}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
