import { Trip } from '@/services/trip-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface TripMapProps {
    trip: Trip;
}

export function TripMap({ trip }: TripMapProps) {
    const location = trip.primaryDestinationCity
        ? `${trip.primaryDestinationCity}, ${trip.primaryDestinationCountry || ''}`
        : trip.primaryDestinationCountry || trip.name;

    const query = encodeURIComponent(location);
    const mapUrl = `https://maps.google.com/maps?q=${query}&z=12&output=embed`;

    return (
        <Card className="col-span-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Map Preview
                </CardTitle>
                <span className="text-sm text-muted-foreground">{location}</span>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative h-[300px] w-full">
                    <iframe
                        title="Trip Map"
                        src={mapUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
