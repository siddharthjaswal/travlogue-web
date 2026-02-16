'use client';

import { Trip } from '@/services/trip-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
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
        <Card className="col-span-full overflow-hidden animate-fade-in rounded-3xl p-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Map Preview
                </CardTitle>
                <span className="text-sm text-muted-foreground">{location}</span>
            </CardHeader>
            <CardContent className="p-0">
                <div className="aspect-square w-full">
                    <StyledMap center={center} marker={center} rounded="rounded-3xl" className="h-full w-full" />
                </div>
            </CardContent>
        </Card>
    );
}
