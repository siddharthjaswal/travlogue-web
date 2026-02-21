import api from '@/lib/api';

export interface TripInvitation {
    id: number;
    tripId: number;
    inviteeEmail: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
    token?: string;
}

const mapInvitation = (data: any): TripInvitation => ({
    id: data.id,
    tripId: data.trip_id,
    inviteeEmail: data.invitee_email,
    role: (data.role || '').toLowerCase(),
    status: (data.status || '').toLowerCase(),
    token: data.token,
});

export const tripInvitationService = {
    list: async (tripId: number): Promise<TripInvitation[]> => {
        const response = await api.get(`/trips/${tripId}/invitations`);
        return (response.data || []).map(mapInvitation);
    },
    create: async (tripId: number, inviteeEmail: string, role: 'owner' | 'editor' | 'viewer', message?: string) => {
        const response = await api.post(`/trips/${tripId}/invitations`, {
            trip_id: tripId,
            invitee_email: inviteeEmail,
            role,
            message,
        });
        return mapInvitation(response.data);
    },
    cancel: async (tripId: number, invitationId: number) => {
        await api.delete(`/trips/${tripId}/invitations/${invitationId}`);
    },
    resend: async (tripId: number, invitationId: number) => {
        const response = await api.post(`/trips/${tripId}/invitations/${invitationId}/resend`);
        return mapInvitation(response.data);
    },
};
