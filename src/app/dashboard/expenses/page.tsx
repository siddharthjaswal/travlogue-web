'use client';

import { useTrips } from '@/hooks/use-trips';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpensesPage() {
  const { data: trips, isLoading } = useTrips();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
      <p className="text-muted-foreground mt-2">Pick a trip to view and manage its budget.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && [1,2,3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}

        {!isLoading && trips?.length ? trips.map((trip: any) => (
          <div key={trip.id} className="rounded-2xl border border-border/40 p-5 bg-card/60">
            <div className="font-semibold text-lg truncate">{trip.name}</div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {trip.primaryDestinationCity || trip.primaryDestinationCountry || 'Destination'}
            </p>
            <Link href={`/dashboard/trips/${trip.id}`} className="block mt-4">
              <Button variant="secondary" className="w-full">Open Budget</Button>
            </Link>
          </div>
        )) : null}

        {!isLoading && (!trips || trips.length === 0) && (
          <div className="rounded-2xl border border-dashed border-border/50 p-10 text-center text-sm text-muted-foreground">
            No trips yet. Create one to start tracking expenses.
          </div>
        )}
      </div>
    </div>
  );
}
