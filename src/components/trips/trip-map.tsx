'use client';

import { Trip } from '@/services/trip-service';
import { CardContent } from '@/components/ui/card';
import { StyledMap } from '@/components/maps/styled-map';
import { guessCenter } from '@/lib/geo';

interface TripMapProps {
    trip: Trip;
}

export function TripMap({ trip }: TripMapProps) {
    const location = trip.primaryDestinationCity
        ? `${trip.primaryDestinationCity}, ${trip.primaryDestinationCountry || ''}`
        : trip.primaryDestinationCountry || trip.name;

    const center = guessCenter(trip.primaryDestinationCity, trip.primaryDestinationCountry);

    return (
        <div className="col-span-full overflow-hidden animate-fade-in rounded-3xl">
            <CardContent className="p-0">
                <div className="w-full">
                    <StyledMap center={center} marker={center} rounded="rounded-3xl" className="w-full" height={800} />
                </div>
            </CardContent>
        </div>
    );
}
