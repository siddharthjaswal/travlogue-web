'use client';

import { Activity } from '@/services/activity-service';
import { Plane, Hotel, Utensils, Camera, MapPin, Pencil, ExternalLink, Train, Bus, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddActivityDialog } from './add-activity-dialog';

interface ActivityItemProps {
    activity: Activity;
    tripId: number;
    date: Date;
    dayPlace?: string;
}

export function ActivityItem({ activity, tripId, date }: ActivityItemProps) {
    const getActivityIcon = (type: string, location?: string) => {
        const t = type.toLowerCase();
        if (t === 'transportation' && location?.includes('•')) {
            const mode = location.split('•')[1].trim().toLowerCase();
            if (mode.includes('train')) return Train;
            if (mode.includes('bus')) return Bus;
            if (mode.includes('car')) return Car;
            if (mode.includes('flight')) return Plane;
        }
        switch (t) {
            case 'transportation': return Plane;
            case 'other': return Hotel;
            case 'dining': return Utensils;
            case 'sightseeing': return Camera;
            default: return MapPin;
        }
    };

    const Icon = getActivityIcon(activity.activityType, activity.location);
    const isMapLink = activity.location?.startsWith('http');
    const currencySymbol = (code?: string) => {
        if (!code) return '$';
        const c = code.toUpperCase();
        if (c === 'USD') return '$';
        if (c === 'EUR') return '€';
        if (c === 'GBP') return '£';
        if (c === 'INR') return '₹';
        if (c === 'JPY') return '¥';
        if (c === 'AUD') return 'A$';
        if (c === 'CAD') return 'C$';
        return c;
    };

    const formatTimeLabel = (time?: string) => {
        if (!time) return '';
        const [h, m] = time.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return time;
        const hour12 = ((h + 11) % 12) + 1;
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };
    return (
        <div className="group relative flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
            {/* 1. Time Column */}
            <div className="hidden sm:flex w-full sm:w-[48px] pt-1 flex-col items-end justify-start">
                <span className="text-sm font-bold text-foreground tabular-nums">
                    {activity.time || 'Any'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {activity.time ? (parseInt(activity.time) >= 12 ? 'PM' : 'AM') : 'TIME'}
                </span>
            </div>

            {/* 2. Timeline Track (desktop only) */}
            <div className="relative hidden sm:flex flex-col items-center pt-1">
                <div className="absolute top-8 bottom-[-24px] w-px bg-border/40 group-last:hidden" />
                <div className="relative z-10 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            {/* 3. Content Card */}
            <div className="flex-1 pb-2">
                <div className={`relative border border-border/30 rounded-xl p-3 ${(() => {
                    const t = activity.activityType.toLowerCase();
                    if (t.includes('sightseeing')) return 'bg-[#7FD1C8]/18';
                    if (t.includes('dining')) return 'bg-[#F2A477]/18';
                    if (t.includes('transport')) return 'bg-[#A8A4F2]/18';
                    if (t.includes('other')) return 'bg-[#8FB7FF]/18';
                    return 'bg-[#C5B8A5]/18';
                })()}`}>
                    <div className="relative flex flex-col gap-3">
                        <div className="sm:hidden">
                            {activity.time && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/70 px-3 py-1 text-xs font-semibold text-foreground">
                                    {formatTimeLabel(activity.time)}{activity.endTime ? ` – ${formatTimeLabel(activity.endTime)}` : ''}
                                </div>
                            )}
                        </div>

                        <div className="flex items-stretch justify-between gap-3">
                            <div className="flex flex-col justify-center gap-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                                    {activity.activityType === 'transportation' && (
                                        <Icon className="h-3 w-3" />
                                    )}
                                    {activity.activityType}
                                </span>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h4 className="text-left text-lg font-semibold text-foreground break-words">
                                        {activity.name}
                                    </h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {activity.cost && (
                                    <div className="rounded-full border border-border/40 bg-background/70 px-4 py-1.5 leading-[1] text-xl font-semibold text-foreground flex items-center justify-center translate-y-[-1px] mt-[14px]">
                                        {currencySymbol(activity.currency)} {activity.cost}
                                    </div>
                                )}
                                <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <AddActivityDialog
                                        tripId={tripId}
                                        initialDate={date}
                                        mode="edit"
                                        activity={activity}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground/80">
                            {activity.duration && (
                                <div className="flex items-center gap-1 text-foreground/70 bg-muted/50 px-1.5 rounded-md">
                                    <span className="text-xs font-medium">{activity.duration}h</span>
                                </div>
                            )}
                            {isMapLink && (
                                <a
                                    href={activity.location}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="h-3 w-3" /> Open in Maps
                                </a>
                            )}
                        </div>

                        {activity.notes && (
                            <p className="mt-2 text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-0.5">
                                {activity.notes}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
