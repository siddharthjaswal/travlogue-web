import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accommodationService, CreateAccommodationData } from '@/services/accommodation-service';

export function useAccommodationsByTrip(tripId: number) {
  return useQuery({
    queryKey: ['accommodations', 'trip', tripId],
    queryFn: () => accommodationService.listByTrip(tripId),
    enabled: !!tripId,
  });
}

export function useCreateAccommodation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccommodationData) => accommodationService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', 'trip', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-timeline', variables.tripId] });
    },
  });
}
