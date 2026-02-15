'use client';

import { useMemo, useState } from 'react';
import { useTrips } from '@/hooks/use-trips';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Wallet } from 'lucide-react';

export default function ExpensesPage() {
  const { data: trips, isLoading } = useTrips();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!trips) return [];
    const q = query.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t: any) => {
      const haystack = [t.name, t.primaryDestinationCity, t.primaryDestinationCountry]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [trips, query]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground mt-2">Pick a trip to view and manage its budget.</p>
        </div>
        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trips..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="rounded-full px-3">{filtered.length} trips</Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && [1,2,3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}

        {!isLoading && filtered.length ? filtered.map((trip: any) => (
          <div key={trip.id} className="rounded-2xl border border-border/40 p-5 bg-card/60 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="font-semibold text-lg truncate flex-1">{trip.name}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">
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
