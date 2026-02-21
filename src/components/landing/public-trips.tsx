'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tripService, Trip } from '@/services/trip-service';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PublicTrips({ variant = 'gallery' }: { variant?: 'gallery' | 'showcase' }) {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    tripService.getPublic().then(setTrips).catch(() => setTrips([]));
  }, []);

  if (!trips.length) return null;

  const formatDateRange = (trip: Trip) => {
    if (!trip.startDateTimestamp) return 'Flexible dates';
    const start = new Date(trip.startDateTimestamp * 1000);
    const end = trip.endDateTimestamp ? new Date(trip.endDateTimestamp * 1000) : null;
    const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return end ? `${fmt.format(start)} – ${fmt.format(end)}` : fmt.format(start);
  };

  if (variant === 'showcase') {
    const trip = trips[0];
    return (
      <Link href={`/public/trips/${trip.id}`} className="group">
        <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/70 shadow-xl">
          <div className="h-[320px] w-full bg-muted/30">
            {trip.coverPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trip.coverPhotoUrl} alt={trip.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md px-4 py-3 text-white">
            <div className="text-lg font-semibold tracking-tight">{trip.name}</div>
            <div className="mt-1 text-xs text-white/80">{formatDateRange(trip)}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/80">
              <span className="px-2 py-1 rounded-full border border-white/20 bg-white/10">
                {trip.primaryDestinationCity || trip.primaryDestinationCountry || 'Unknown'}
              </span>
              {trip.startDateTimestamp && trip.endDateTimestamp && (
                <span className="px-2 py-1 rounded-full border border-white/20 bg-white/10">
                  {Math.max(1, Math.ceil((trip.endDateTimestamp - trip.startDateTimestamp) / (60 * 60 * 24)))} days
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <section className="py-14">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Explore public trips</h2>
            <p className="text-muted-foreground">Real itineraries shared by travelers. Tap any to see the full plan.</p>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/public/trips/${trip.id}`} className="min-w-[300px] max-w-[300px] snap-start">
              <Card className="rounded-3xl overflow-hidden border-border/40 bg-card/70 shadow-md transition-transform duration-300 hover:-translate-y-1">
                <div className="h-44 w-full bg-muted/30">
                  {trip.coverPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={trip.coverPhotoUrl} alt={trip.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <div className="text-sm font-semibold line-clamp-1">{trip.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{formatDateRange(trip)}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
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
