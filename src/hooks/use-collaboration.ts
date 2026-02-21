import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripMemberService } from '@/services/trip-member-service';
import { tripInvitationService } from '@/services/trip-invitation-service';

export function useTripMembers(tripId: number) {
    return useQuery({
        queryKey: ['trip-members', tripId],
        queryFn: () => tripMemberService.list(tripId),
        enabled: !!tripId,
    });
}

export function useTripInvitations(tripId: number) {
    return useQuery({
        queryKey: ['trip-invitations', tripId],
        queryFn: () => tripInvitationService.list(tripId),
        enabled: !!tripId,
    });
}

export function useInviteTripMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ tripId, email, role, message }: { tripId: number; email: string; role: 'owner' | 'editor' | 'viewer'; message?: string }) =>
            tripInvitationService.create(tripId, email, role, message),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-invitations', variables.tripId] });
        },
    });
}

export function useUpdateTripMemberRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ tripId, userId, role }: { tripId: number; userId: number; role: 'owner' | 'editor' | 'viewer' }) =>
            tripMemberService.updateRole(tripId, userId, role),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-members', variables.tripId] });
        },
    });
}

export function useRemoveTripMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ tripId, userId }: { tripId: number; userId: number }) => tripMemberService.remove(tripId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-members', variables.tripId] });
        },
    });
}

export function useCancelInvitation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ tripId, invitationId }: { tripId: number; invitationId: number }) => tripInvitationService.cancel(tripId, invitationId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-invitations', variables.tripId] });
        },
    });
}

export function useResendInvitation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ tripId, invitationId }: { tripId: number; invitationId: number }) => tripInvitationService.resend(tripId, invitationId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip-invitations', variables.tripId] });
        },
    });
}
