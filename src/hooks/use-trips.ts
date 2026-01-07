import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService, CreateTripData } from '@/services/trip-service';

export function useTrips() {
    return useQuery({
        queryKey: ['trips'],
        queryFn: tripService.getAll,
    });
}

export function useCreateTrip() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTripData) => tripService.create(data),
        onSuccess: () => {
            // Invalidate trips list to refetch
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
}

export function useDeleteTrip() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => tripService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
}
