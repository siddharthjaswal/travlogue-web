'use client';

import { useParams } from 'next/navigation';
import { useTrip } from '@/hooks/use-trips';
import { TripHeader } from '@/components/trips/trip-header';
import { TimelineView } from '@/components/timeline/timeline-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicTripPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: trip, isLoading } = useTrip(id);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!trip) return <div className="p-6">Trip not found.</div>;

  return (
    <div className="space-y-6">
      <TripHeader trip={trip} />
      <TimelineView tripId={id} />
    </div>
  );
}
