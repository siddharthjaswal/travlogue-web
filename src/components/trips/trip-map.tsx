'use client';

import { Trip } from '@/services/trip-service';
import { CardContent } from '@/components/ui/card';
import { StyledMap } from '@/components/maps/styled-map';
import { guessCenter, parseLatLng } from '@/lib/geo';
import { useTripTimeline } from '@/hooks/use-trips';
import { useAccommodationsByTrip } from '@/hooks/use-accommodations';

interface TripMapProps {
    trip: Trip;
    height?: number;
    className?: string;
}

export function TripMap({ trip, height = 800, className }: TripMapProps) {
    const useHeight = height && height > 0 ? height : undefined;
    const { data: timeline } = useTripTimeline(trip.id);
    const { data: accommodations } = useAccommodationsByTrip(trip.id);

    const center = guessCenter(trip.primaryDestinationCity, trip.primaryDestinationCountry);

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
