import api from '@/lib/api';

export interface Activity {
    id: number;
    tripDayId: number;
    name: string;
    activityType: string;
    time?: string;
    duration?: number;
    location?: string;
    cost?: number;
    currency: string;
    status: string;
    displayOrder: number;
    notes?: string;
}

export interface TripDay {
    id: number;
    tripId: number;
    date: string;
    dayNumber: number;
    dayType: string;
    title?: string;
    place: string;
    activities: Activity[];
}

export interface TripTimeline {
    tripId: number;
    days: TripDay[];
}

// Mapper to camelCase
const mapActivity = (data: any): Activity => ({
    id: data.id,
    tripDayId: data.trip_day_id,
    name: data.name,
    activityType: data.activity_type,
    time: data.time,
    duration: data.duration,
    location: data.location,
    cost: data.cost,
    currency: data.currency,
    status: data.status,
    displayOrder: data.display_order,
    notes: data.notes,
});

const mapTripDay = (data: any): TripDay => ({
    id: data.id,
    tripId: data.trip_id,
    date: data.date,
    dayNumber: data.day_number,
    dayType: data.day_type,
    title: data.title,
    place: data.place,
    activities: (data.activities || []).map(mapActivity),
});

export interface CreateActivityData {
    tripId: number;
    activityDate: string; // YYYY-MM-DD
    name: string;
    activityType: string;
    time?: string;
    cost?: number;
    currency?: string;
    location?: string;
    notes?: string;
}

export const activityService = {
    getTimeline: async (tripId: number): Promise<TripTimeline> => {
        const response = await api.get(`/trips/${tripId}/timeline`);
        return {
            tripId: response.data.trip_id,
            days: response.data.days.map(mapTripDay),
        };
    },

    create: async (data: CreateActivityData): Promise<Activity> => {
        const payload = {
            trip_id: data.tripId,
            activity_date: data.activityDate,
            name: data.name,
            activity_type: data.activityType,
            time: data.time,
            cost: data.cost,
            currency: data.currency || 'USD',
            location: data.location,
            notes: data.notes,
        };
        const response = await api.post('/activities/', payload);
        return mapActivity(response.data);
    },
};
