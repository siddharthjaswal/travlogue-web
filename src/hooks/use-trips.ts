import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService, CreateTripData } from '@/services/trip-service';
import { activityService } from '@/services/activity-service';
import { tripDayService, CreateTripDayData } from '@/services/trip-day-service';
import { trackEvent } from '@/lib/analytics';

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
        onSuccess: (trip) => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            trackEvent('trip_created', { trip_id: trip?.id, name: trip?.name });
        },
    });
}

export function useCreateTripDay() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTripDayData) => tripDayService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-timeline', variables.tripId] });
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

export function useRegenerateCover() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, query }: { id: number; query?: string }) => tripService.regenerateCover(id, query),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
}

export function useTrip(id: number) {
    return useQuery({
        queryKey: ['trips', id],
        queryFn: () => tripService.get(id),
        enabled: !!id, // Only run if ID is valid
    });
}

export function useTripTimeline(tripId: number) {
    return useQuery({
        queryKey: ['trip-timeline', tripId],
        queryFn: () => activityService.getTimeline(tripId),
        enabled: !!tripId,
    });
}

export function useCreateActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => activityService.create(data),
        onSuccess: (activity, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-timeline', variables.tripId] });
            queryClient.invalidateQueries({ queryKey: ['expenses', variables.tripId] });
            trackEvent('activity_added', {
                trip_id: variables.tripId,
                activity_id: activity?.id,
                name: activity?.name,
                activity_type: activity?.activityType
            });
        },
    });
}

export function useUpdateActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, tripId }: { id: number; data: any; tripId: number }) => activityService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-timeline', variables.tripId] });
            queryClient.invalidateQueries({ queryKey: ['expenses', variables.tripId] });
            trackEvent('activity_updated', { trip_id: variables.tripId, activity_id: variables.id });
        },
    });
}

export function useDeleteActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number }) => activityService.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-timeline'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
}
