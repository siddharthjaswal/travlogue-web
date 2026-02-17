'use client';

import { Trip } from '@/services/trip-service';
import { activityService } from '@/services/activity-service';
import { useEffect, useRef } from 'react';
import { CardContent } from '@/components/ui/card';
import { StyledMap } from '@/components/maps/styled-map';
import { guessCenter, parseLatLng } from '@/lib/geo';
import api from '@/lib/api';
import { useTripTimeline } from '@/hooks/use-trips';
import { useQueryClient } from '@tanstack/react-query';
import { useAccommodationsByTrip } from '@/hooks/use-accommodations';

interface TripMapProps {
    trip: Trip;
    height?: number;
    className?: string;
}

export function TripMap({ trip, height = 800, className }: TripMapProps) {
    const useHeight = height && height > 0 ? height : undefined;
    const { data: timeline } = useTripTimeline(trip.id);
    const queryClient = useQueryClient();
    const didResolveRef = useRef<Record<number, boolean>>({});
    const { data: accommodations } = useAccommodationsByTrip(trip.id);

    const center = guessCenter(trip.primaryDestinationCity, trip.primaryDestinationCountry);
    const resolveMapLink = async (value: string) => {
        try {
            const res = await api.get('/utils/resolve-map-link', { params: { url: value } });
            if (res?.data?.lat && res?.data?.lng) return { lat: res.data.lat, lng: res.data.lng };
        } catch {}
        return null;
    };

    const splitTransportLinks = (location?: string) => {
        if (!location) return { start: '', end: '' };
        const parts = location.split('→');
        const start = (parts[0] || '').split('•')[0].trim();
        const end = (parts[1] || '').split('•')[0].trim();
        return { start, end };
    };

    useEffect(() => {
        if (!timeline?.days?.length) return;
        const isLink = (v: string) => v.includes('maps.app.goo.gl') || v.includes('google.com/maps');
        (async () => {
            for (const day of timeline.days) {
                for (const activity of day.activities) {
                    if (activity.activityType !== 'transportation') continue;
                    if (didResolveRef.current[activity.id]) continue;
                    const hasStart = activity.startLatitude != null && activity.startLongitude != null;
                    const hasEnd = activity.endLatitude != null && activity.endLongitude != null;
                    if (hasStart && hasEnd) continue;
                    const { start, end } = splitTransportLinks(activity.location);
                    const resolvedStart = !hasStart && isLink(start) ? await resolveMapLink(start) : null;
                    const resolvedEnd = !hasEnd && isLink(end) ? await resolveMapLink(end) : null;
                    if (!resolvedStart && !resolvedEnd) continue;
                    didResolveRef.current[activity.id] = true;
                    await activityService.update(activity.id, {
                        startLatitude: resolvedStart?.lat ?? activity.startLatitude ?? null,
                        startLongitude: resolvedStart?.lng ?? activity.startLongitude ?? null,
                        endLatitude: resolvedEnd?.lat ?? activity.endLatitude ?? null,
                        endLongitude: resolvedEnd?.lng ?? activity.endLongitude ?? null,
                    });
                    queryClient.invalidateQueries({ queryKey: ['trip-timeline', trip.id] });
                }
            }
        })();
    }, [timeline?.days?.length]);


    const activityMarkers = (timeline?.days || [])
        .flatMap((day) => day.activities.map((a) => ({ activity: a, place: day.place })))
        .map(({ activity, place }) => {
            const coords = (activity.latitude != null && activity.longitude != null)
                ? { lat: Number(activity.latitude), lng: Number(activity.longitude) }
                : parseLatLng(activity.location);
            if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return null;
            return { ...coords, kind: 'activity' as const, type: activity.activityType, title: activity.name, subtitle: activity.location || place };
        })
        .filter(Boolean) as { lat: number; lng: number; kind: 'activity'; type?: string; title?: string; subtitle?: string }[];

    const stayMarkers = (accommodations || [])
        .map((a) => (a.latitude != null && a.longitude != null
            ? { lat: Number(a.latitude), lng: Number(a.longitude), kind: 'stay' as const, type: 'stay', title: a.name, subtitle: a.address || '' }
            : null))
        .filter(Boolean) as { lat: number; lng: number; kind: 'stay'; type?: string; title?: string; subtitle?: string }[];

    const transportMarkers = (timeline?.days || [])
        .flatMap((day) => day.activities)
        .flatMap((activity) => {
            const points = [] as { lat: number; lng: number; kind: 'activity'; type?: string; title?: string; subtitle?: string }[];
            if (activity.startLatitude != null && activity.startLongitude != null) {
                points.push({
                    lat: Number(activity.startLatitude),
                    lng: Number(activity.startLongitude),
                    kind: 'activity',
                    type: 'transportation',
                    title: activity.name,
                    subtitle: activity.location || undefined,
                });
            }
            if (activity.endLatitude != null && activity.endLongitude != null) {
                points.push({
                    lat: Number(activity.endLatitude),
                    lng: Number(activity.endLongitude),
                    kind: 'activity',
                    type: 'transportation',
                    title: activity.name,
                    subtitle: activity.location || undefined,
                });
            }
            return points;
        });

    const transportPaths = (timeline?.days || [])
        .flatMap((day) => day.activities)
        .map((activity) => {
            if (activity.startLatitude == null || activity.startLongitude == null || activity.endLatitude == null || activity.endLongitude == null) return null;
            return [
                { lat: Number(activity.startLatitude), lng: Number(activity.startLongitude) },
                { lat: Number(activity.endLatitude), lng: Number(activity.endLongitude) },
            ];
        })
        .filter(Boolean) as { lat: number; lng: number }[][];

    const markers = [...activityMarkers, ...stayMarkers, ...transportMarkers];

    return (
        <div className={`col-span-full overflow-hidden animate-fade-in rounded-3xl ${className || ''} h-full`}>
            <CardContent className="p-0 h-full">
                <div className="w-full h-full">
                    <StyledMap center={center} markers={markers} paths={transportPaths} rounded="rounded-3xl" className="w-full h-full" height={useHeight} />
                </div>
            </CardContent>
        </div>
    );
}
