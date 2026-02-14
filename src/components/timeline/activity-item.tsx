'use client';

import { Activity } from '@/services/activity-service';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel, Utensils, Camera, MapPin, Clock, DollarSign, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddActivityDialog } from './add-activity-dialog';
import { parseLatLng } from '@/lib/geo';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

interface ActivityItemProps {
    activity: Activity;
    tripId: number;
    date: Date;
}

const photoCache = new Map<string, string>();

export function ActivityItem({ activity, tripId, date }: ActivityItemProps) {
    const getActivityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'transit': return Plane;
            case 'accommodation': return Hotel;
            case 'dining': return Utensils;
            case 'sightseeing': return Camera;
            default: return MapPin;
        }
    };

    const Icon = getActivityIcon(activity.activityType);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        const coords = (activity.latitude && activity.longitude)
            ? { lat: activity.latitude, lng: activity.longitude }
            : parseLatLng(activity.location || '');
        if (!coords || !activity.name) return;

        const cacheKey = `${activity.id}-${activity.name}`;
        if (photoCache.has(cacheKey)) {
            setPhotoUrl(photoCache.get(cacheKey) || null);
            return;
        }

        (async () => {
            try {
                const res = await api.get('/activities/place-photo', {
                    params: { query: activity.name }
                });
                const url = res?.data?.url;
                if (url) {
                    photoCache.set(cacheKey, url);
                    setPhotoUrl(url);
                }
            } catch {
                // ignore
            }
        })();
    }, [activity.id, activity.location, activity.name, activity.latitude, activity.longitude]);

    return (
        <div className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
            {/* 1. Time Column */}
            <div className="w-full sm:w-[60px] pt-1 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                <span className="text-sm font-bold text-foreground tabular-nums">
                    {activity.time || 'Any'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {activity.time ? (parseInt(activity.time) >= 12 ? 'PM' : 'AM') : 'TIME'}
                </span>
            </div>

            {/* 2. Timeline Track */}
            <div className="relative flex flex-col items-center pt-1 sm:pt-1">
                {/* Vertical Line */}
                <div className="absolute top-8 bottom-[-24px] w-px bg-border/40 group-last:hidden hidden sm:block" />

                {/* Icon Bubble */}
                <div className="relative z-10 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground shadow-sm group-hover:border-primary group-hover:text-primary transition-colors duration-300">
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            {/* 3. Content Card */}
            <div className="flex-1 pb-2">
                <div className="relative bg-card hover:bg-muted/30 border border-border/40 hover:border-primary/20 rounded-xl p-4 transition-all duration-300 group-hover:shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                            {photoUrl && (
                                <div className="mb-3 sm:hidden overflow-hidden rounded-lg border border-border/40">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photoUrl} alt={activity.name} className="h-36 w-full object-cover" />
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="font-semibold text-base truncate pr-2 text-foreground/90 group-hover:text-primary transition-colors">
                                    {activity.name}
                                </h4>
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-medium text-muted-foreground bg-muted hover:bg-muted cursor-default">
                                    {activity.activityType}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground/80">
                                {activity.location && (
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                                        <span className="truncate">{activity.location}</span>
                                    </div>
                                )}
                                {activity.cost && (
                                    <div className="flex items-center gap-1 text-foreground/70 bg-muted/50 px-1.5 rounded-md">
                                        <DollarSign className="h-3 w-3" />
                                        <span className="text-xs font-medium">{activity.currency} {activity.cost}</span>
                                    </div>
                                )}
                            </div>

                            {activity.notes && (
                                <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-0.5">
                                    {activity.notes}
                                </p>
                            )}
                        </div>

                        {photoUrl && (
                            <div className="hidden sm:block shrink-0 overflow-hidden rounded-lg border border-border/40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photoUrl} alt={activity.name} className="h-20 w-28 object-cover" />
                            </div>
                        )}

                        {/* Edit Action - Visible on Hover */}
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
