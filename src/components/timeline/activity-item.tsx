'use client';

import { Activity } from '@/services/activity-service';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel, Utensils, Camera, MapPin, Clock, DollarSign, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddActivityDialog } from './add-activity-dialog';

interface ActivityItemProps {
    activity: Activity;
    tripId: number;
    date: Date;
}

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

    return (
        <div className="group relative grid grid-cols-[60px_40px_1fr] gap-4 mb-2 min-h-[80px]">
            {/* 1. Time Column */}
            <div className="text-right pt-2">
                <span className="text-sm font-semibold text-muted-foreground">
                    {activity.time || 'All Day'}
                </span>
            </div>

            {/* 2. Timeline Track */}
            <div className="relative flex flex-col items-center">
                {/* Vertical Line */}
                <div className="absolute top-0 bottom-[-16px] w-px border-l border-dashed border-border group-last:bottom-0" />

                {/* Icon Bubble */}
                <div className="relative z-10 h-10 w-10 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary shadow-sm group-hover:border-primary transition-colors">
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            {/* 3. Content Card */}
            <div className="pt-1 pb-4 pr-4">
                <div className="flex items-start justify-between bg-card/50 hover:bg-card border border-transparent hover:border-border rounded-lg p-3 transition-all">
                    <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-base truncate">{activity.name}</h4>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground uppercase tracking-wide">
                                {activity.activityType}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {activity.location && (
                                <div className="flex items-center gap-1 max-w-[200px] truncate">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{activity.location}</span>
                                </div>
                            )}
                            {activity.cost && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <span className="text-xs font-medium">{activity.currency} {activity.cost}</span>
                                </div>
                            )}
                        </div>

                        {activity.notes && (
                            <p className="mt-2 text-sm text-muted-foreground/80 line-clamp-2 italic text-[13px]">
                                "{activity.notes}"
                            </p>
                        )}
                    </div>

                    {/* Edit Action - Visible on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddActivityDialog
                            tripId={tripId}
                            initialDate={date} // Passed for context, though editing reuses activity date mostly
                            mode="edit"
                            activity={activity}
                            trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
