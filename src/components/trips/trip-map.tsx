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
            <CardContent className="p-0">
                <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                    <StyledMap center={center} marker={center} rounded="rounded-3xl" className="absolute inset-0" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md px-3 py-2 text-white/90">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-4 w-4 text-white/80" />
                            Map Preview
                        </div>
                        <span className="text-xs text-white/70 truncate">{location}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
