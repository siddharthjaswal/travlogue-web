import { useQuery } from '@tanstack/react-query';
import { transitService } from '@/services/transit-service';

export function useTransits(tripDayId: number) {
  return useQuery({
    queryKey: ['transits', tripDayId],
    queryFn: () => transitService.listByTripDay(tripDayId),
    enabled: !!tripDayId,
  });
}
