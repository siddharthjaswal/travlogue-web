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

            <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <span className="capitalize font-medium">{trip.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Visibility</span>
                        <span className="capitalize font-medium">{trip.visibility}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">
                            {trip.startDateTimestamp && trip.endDateTimestamp
                                ? `${Math.ceil((trip.endDateTimestamp - trip.startDateTimestamp) / (60 * 60 * 24))} days`
                                : 'N/A'
                            }
                        </span>
                    </div>
                </CardContent>
            </Card>

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
