'use client';

import { Activity } from '@/services/activity-service';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel, Utensils, Camera, MapPin, DollarSign, Pencil, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddActivityDialog } from './add-activity-dialog';

interface ActivityItemProps {
    activity: Activity;
    tripId: number;
    date: Date;
    dayPlace?: string;
}

export function ActivityItem({ activity, tripId, date }: ActivityItemProps) {
    const getActivityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'transportation': return Plane;
            case 'other': return Hotel;
            case 'dining': return Utensils;
            case 'sightseeing': return Camera;
            default: return MapPin;
        }
    };

    const Icon = getActivityIcon(activity.activityType);
    const isMapLink = activity.location?.startsWith('http');

    return (
        <div className="group relative flex flex-col sm:flex-row gap-4 sm:gap-4 mb-3">
            {/* 1. Time Column */}
            <div className="hidden sm:flex w-full sm:w-[48px] pt-1 flex-col items-end justify-start">
                <span className="text-sm font-bold text-foreground tabular-nums">
                    {activity.time || 'Any'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {activity.time ? (parseInt(activity.time) >= 12 ? 'PM' : 'AM') : 'TIME'}
                </span>
            </div>

            {/* 2. Timeline Track */}
            <div className="relative flex flex-col items-center pt-1 sm:pt-1">
                <div className="absolute top-8 bottom-[-24px] w-px bg-border/40 group-last:hidden hidden sm:block" />
                <div className="relative z-10 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            {/* 3. Content Card */}
            <div className="flex-1 pb-2">
                <div className={`relative border border-border/30 rounded-xl p-3 ${(() => {
                    const t = activity.activityType.toLowerCase();
                    if (t.includes('sightseeing')) return 'bg-[#8FA6C8]/18';
                    if (t.includes('dining')) return 'bg-[#C8A38C]/18';
                    if (t.includes('transport')) return 'bg-[#7C97C9]/18';
                    if (t.includes('other')) return 'bg-[#A5BBD6]/18';
                    return 'bg-[#9AA8BC]/18';
                })()}`}>
                    <div className="relative flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h4 className="font-medium text-sm truncate pr-2 text-foreground">
                                        {activity.name}
                                    </h4>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                        {activity.activityType}
                                    </span>
                                </div>
                                <span className="sm:hidden text-xs font-semibold text-muted-foreground">
                                    {activity.time || 'Any'} {activity.time ? (parseInt(activity.time) >= 12 ? 'PM' : 'AM') : ''}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground/80">
                                {activity.duration && (
                                    <div className="flex items-center gap-1 text-foreground/70 bg-muted/50 px-1.5 rounded-md">
                                        <span className="text-xs font-medium">{activity.duration}h</span>
                                    </div>
                                )}
                                {activity.cost && (
                                    <div className="flex items-center gap-1 text-foreground/70 bg-muted/50 px-1.5 rounded-md">
                                        <DollarSign className="h-3 w-3" />
                                        <span className="text-xs font-medium">{activity.currency} {activity.cost}</span>
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
                                <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-0.5">
                                    {activity.notes}
                                </p>
                            )}
                        </div>

                        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity absolute top-2 right-2">
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
            </div>
        </div>
    );
}
