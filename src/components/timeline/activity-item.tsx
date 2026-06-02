'use client';

import { Activity } from '@/services/activity-service';
import { Plane, Hotel, Utensils, Camera, MapPin, Pencil, ExternalLink, Train, Bus, Car, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddActivityDialog } from './add-activity-dialog';
import { googleDirectionsUrl, googlePlaceUrl } from '@/lib/maps-deep-link';
import { RoutePreview } from '@/components/maps/route-preview';
import { useRoute } from '@/hooks/use-route';
import { useAuth } from '@/contexts/auth-context';
import { formatDistance, formatDuration } from '@/lib/format';

const MODE_COLORS: Record<string, string> = {
    car: '#A8A4F2', bus: '#A8A4F2', train: '#A8A4F2', ferry: '#8FB7FF',
    flight: '#7FD1C8', walk: '#9DD49A',
};
const ROAD_MODES = ['car', 'bus', 'walk', 'taxi'];

interface ActivityItemProps {
    activity: Activity;
    tripId: number;
    date: Date;
    dayPlace?: string;
    readOnly?: boolean;
}

export function ActivityItem({ activity, tripId, date, readOnly }: ActivityItemProps) {
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

    // ── "Open in Maps" deep links ──────────────────────────────────────
    const isTransport = activity.activityType?.toLowerCase() === 'transportation';
    const baseLoc = (activity.location || '').split('•')[0];
    const transportMode = (activity.location || '').split('•')[1]?.trim();
    const [fromLabel, toLabel] = baseLoc.split('→').map((s) => s.trim());

    // Transport segment → directions (navigate the route for real).
    const directionsHref = isTransport
        ? googleDirectionsUrl(
              { lat: activity.startLatitude, lng: activity.startLongitude, label: fromLabel },
              { lat: activity.endLatitude, lng: activity.endLongitude, label: toLabel },
              transportMode
          )
        : null;

    // Non-transport with a location → open the place.
    const placeHref = !isTransport && !isMapLink
        ? googlePlaceUrl({ lat: activity.latitude, lng: activity.longitude, label: baseLoc || undefined })
        : null;

    // ── Route preview (map path + ETA on the card) ─────────────────────
    const { user } = useAuth();
    const unit = user?.unitSystem ?? 'metric';
    const fromPt = isTransport && activity.startLatitude != null && activity.startLongitude != null
        ? { lat: Number(activity.startLatitude), lng: Number(activity.startLongitude) }
        : null;
    const toPt = isTransport && activity.endLatitude != null && activity.endLongitude != null
        ? { lat: Number(activity.endLatitude), lng: Number(activity.endLongitude) }
        : null;
    const isRoadMode = ROAD_MODES.includes((transportMode || '').toLowerCase());
    // Fetch the real road route only for road modes (others draw a straight line).
    const { data: route } = useRoute(fromPt, toPt, isRoadMode && !!fromPt && !!toPt);

    const routeGeometry: [number, number][] | null =
        route?.geometry && route.geometry.length >= 2
            ? route.geometry
            : fromPt && toPt
                ? [[fromPt.lat, fromPt.lng], [toPt.lat, toPt.lng]]
                : null;
    const routeColor = MODE_COLORS[(transportMode || '').toLowerCase()] || '#A8A4F2';
    const etaLabel = route?.duration_s
        ? `${formatDuration(route.duration_s)}${route.distance_m ? ' · ' + formatDistance(route.distance_m, unit) : ''}`
        : activity.duration
            ? `${activity.duration}h`
            : null;
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
    const [timeClock, timeMeridiem] = (activity.time ? formatTimeLabel(activity.time) : '').split(' ');
    return (
        <div className="group relative flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
            {/* 1. Time Column */}
            <div className="flex w-[44px] sm:w-[48px] pt-1 flex-col items-end justify-start">
                <span className="text-sm font-bold text-foreground tabular-nums">
                    {timeClock || 'Any'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {timeMeridiem || 'TIME'}
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
                <div className={`relative p-0 sm:border sm:border-border/30 sm:rounded-xl sm:p-3 ${(() => {
                    const t = activity.activityType.toLowerCase();
                    if (t.includes('sightseeing')) return 'sm:bg-[#7FD1C8]/18';
                    if (t.includes('dining')) return 'sm:bg-[#F2A477]/18';
                    if (t.includes('transport')) return 'sm:bg-[#A8A4F2]/18';
                    if (t.includes('other')) return 'sm:bg-[#8FB7FF]/18';
                    return 'sm:bg-[#C5B8A5]/18';
                })()}`}>
                    <div className="relative flex flex-col gap-3">
                        <div className="hidden sm:hidden">
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
                                {activity.cost ? (
                                    <div className="rounded-full border border-border/40 bg-background/70 px-4 py-1.5 leading-[1] text-xl font-semibold text-foreground flex items-center justify-center translate-y-[-1px] mt-[14px]">
                                        {currencySymbol(activity.currency)} {activity.cost}
                                    </div>
                                ) : null}
                                {!readOnly && (
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
                                )}
                            </div>
                        </div>

                        {isTransport && routeGeometry && (
                            <div className="relative mt-2 overflow-hidden rounded-xl border border-border/40 bg-muted/15">
                                <RoutePreview geometry={routeGeometry} color={routeColor} height={72} />
                                {etaLabel && (
                                    <span className="absolute bottom-1.5 right-2 rounded-full border border-border/50 bg-background/85 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur">
                                        {etaLabel}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground/80">
                            {activity.duration && (
                                <div className="flex items-center gap-1 text-foreground/70 bg-muted/50 px-1.5 rounded-md">
                                    <span className="text-xs font-medium">{activity.duration}h</span>
                                </div>
                            )}
                            {directionsHref ? (
                                <a
                                    href={directionsHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary/90 hover:text-primary"
                                >
                                    <Navigation className="h-3 w-3" /> Open route in Maps
                                </a>
                            ) : isMapLink ? (
                                <a
                                    href={activity.location}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="h-3 w-3" /> Open in Maps
                                </a>
                            ) : placeHref ? (
                                <a
                                    href={placeHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="h-3 w-3" /> Open in Maps
                                </a>
                            ) : null}
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
