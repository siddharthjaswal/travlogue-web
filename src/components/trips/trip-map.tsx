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
        <Card className="col-span-full overflow-hidden animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Map Preview
                </CardTitle>
                <span className="text-sm text-muted-foreground">{location}</span>
            </CardHeader>
            <CardContent className="p-0">
                <StyledMap center={center} marker={center} height={300} rounded="rounded-none" />
            </CardContent>
        </Card>
    );
}
