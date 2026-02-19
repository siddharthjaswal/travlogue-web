import api from '@/lib/api';

export interface TripMember {
    id: number;
    tripId: number;
    userId: number;
    role: 'owner' | 'editor' | 'viewer';
    userEmail?: string | null;
    userName?: string | null;
    userAvatar?: string | null;
}

const mapMember = (data: any): TripMember => ({
    id: data.id,
    tripId: data.trip_id,
    userId: data.user_id,
    role: (data.role || '').toLowerCase(),
    userEmail: data.user_email,
    userName: data.user_name,
    userAvatar: data.user_avatar,
});

export const tripMemberService = {
    list: async (tripId: number): Promise<TripMember[]> => {
        const response = await api.get(`/trips/${tripId}/members`);
        return (response.data || []).map(mapMember);
    },
    updateRole: async (tripId: number, userId: number, role: 'owner' | 'editor' | 'viewer'): Promise<TripMember> => {
        const response = await api.put(`/trips/${tripId}/members/${userId}`, { role });
        return mapMember(response.data);
    },
    remove: async (tripId: number, userId: number) => {
        await api.delete(`/trips/${tripId}/members/${userId}`);
    },
};
