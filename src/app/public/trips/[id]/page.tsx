'use client';

import { useParams } from 'next/navigation';
import { useTrip } from '@/hooks/use-trips';
import { TripHeader } from '@/components/trips/trip-header';
import { TimelineView } from '@/components/timeline/timeline-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Copy, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PublicTripPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: trip, isLoading } = useTrip(id);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!trip) return <div className="p-6">Trip not found.</div>;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Public trip • Read-only</div>
          <h2 className="text-2xl font-semibold">Explore the full itinerary</h2>
          <p className="text-sm text-muted-foreground">Make a copy to edit, or share the public link.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
          <Link href="/login">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Clone trip
            </Button>
          </Link>
        </div>
      </div>

      <TripHeader trip={trip} readOnly />
      <TimelineView tripId={id} readOnly />
    </div>
  );
}
