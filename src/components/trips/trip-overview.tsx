import { Trip } from '@/services/trip-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TripMap } from './trip-map';

interface TripOverviewProps {
    trip: Trip;
}

export function TripOverview({ trip }: TripOverviewProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {trip.description && (
                <Card className="col-span-2 rounded-2xl border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>About this Trip</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {trip.description}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Map Preview */}
            <TripMap trip={trip} />

            {/* Placeholder for future widgets like Weather, Tasks, etc. */}
            <Card className="col-span-full md:col-span-1 rounded-2xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>Travellers</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Manage members (Coming soon)</p>
                </CardContent>
            </Card>
        </div>
    );
}
