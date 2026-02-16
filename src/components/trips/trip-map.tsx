'use client';

import { Trip } from '@/services/trip-service';
import { CardContent } from '@/components/ui/card';
import { StyledMap } from '@/components/maps/styled-map';
import { guessCenter, parseLatLng } from '@/lib/geo';
import { useTripTimeline } from '@/hooks/use-trips';
import { useAccommodationsByTrip } from '@/hooks/use-accommodations';

interface TripMapProps {
    trip: Trip;
}

export function TripMap({ trip }: TripMapProps) {
    const { data: timeline } = useTripTimeline(trip.id);
    const { data: accommodations } = useAccommodationsByTrip(trip.id);

    const center = guessCenter(trip.primaryDestinationCity, trip.primaryDestinationCountry);

    const activityMarkers = (timeline?.days || [])
        .flatMap((day) => day.activities.map((a) => ({ activity: a, place: day.place })))
        .map(({ activity, place }) => {
            const coords = parseLatLng(activity.location);
            if (!coords) return null;
            return { ...coords, kind: 'activity' as const, type: activity.activityType, title: activity.name, subtitle: activity.location || place };
        })
        .filter(Boolean) as { lat: number; lng: number; kind: 'activity'; type?: string; title?: string; subtitle?: string }[];

    const stayMarkers = (accommodations || [])
        .map((a) => (a.latitude && a.longitude ? { lat: a.latitude, lng: a.longitude, kind: 'stay' as const, type: 'stay', title: a.name, subtitle: a.address || '' } : null))
        .filter(Boolean) as { lat: number; lng: number; kind: 'stay'; type?: string; title?: string; subtitle?: string }[];

    const markers = [...activityMarkers, ...stayMarkers];

    return (
        <div className="col-span-full overflow-hidden animate-fade-in rounded-3xl">
            <CardContent className="p-0">
                <div className="w-full">
                    <StyledMap center={center} markers={markers} rounded="rounded-3xl" className="w-full" height={800} />
                </div>
            </CardContent>
        </div>
    );
}
