'use client';

import { Activity } from '@/services/activity-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel, Utensils, Camera, MapPin, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
    activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
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
        <Card className="mb-4 hover:shadow-md transition-shadow border-l-4 border-l-primary/50 overflow-hidden">
            <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 mt-1">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-base truncate pr-2">{activity.name}</h4>
                        {activity.cost && (
                            <Badge variant="secondary" className="flex-shrink-0 text-xs font-normal">
                                {activity.currency} {activity.cost}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground gap-4 mb-2">
                        {activity.time && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{activity.time}</span>
                            </div>
                        )}
                        {activity.location && (
                            <div className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{activity.location}</span>
                            </div>
                        )}
                    </div>

                    {activity.notes && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-2 bg-muted/30 p-2 rounded-md italic">
                            "{activity.notes}"
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
