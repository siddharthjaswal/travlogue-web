'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tripService, Trip } from '@/services/trip-service';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PublicTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    tripService.getPublic().then(setTrips).catch(() => setTrips([]));
  }, []);

  if (!trips.length) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Public trips</h2>
            <p className="text-muted-foreground">Explore itineraries shared by the community.</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/public/trips/${trip.id}`} className="min-w-[260px] max-w-[260px]">
              <Card className="rounded-2xl overflow-hidden border-border/40 bg-card/60">
                <div className="h-36 w-full bg-muted/30">
                  {trip.coverPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={trip.coverPhotoUrl} alt={trip.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold line-clamp-1">{trip.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{trip.primaryDestinationCity || trip.primaryDestinationCountry || 'Unknown'}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
