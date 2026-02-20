import api from '@/lib/api';

export interface Trip {
    id: number;
    name: string;
    description?: string;
    coverPhotoUrl?: string;
    bannerPhotoUrl?: string;

    // Dates
    startDateTimestamp?: number;
    endDateTimestamp?: number;

    // Location
    primaryDestinationCountry?: string;
    primaryDestinationCity?: string;

    // Status
    status: 'planning' | 'active' | 'completed' | 'cancelled';
    visibility: 'private' | 'public' | 'unlisted';

    // Stats
    daysCount?: number;
}

export interface CreateTripData {
    name: string;
    description?: string;
    startDateTimestamp?: number;
    endDateTimestamp?: number;
    primaryDestinationCountry?: string;
    primaryDestinationCity?: string;
}

// Mapper to convert Snake Case (API) to Camel Case (Frontend)
const mapTripResponse = (data: any): Trip => ({
    id: data.id,
    name: data.name,
    description: data.description,
    coverPhotoUrl: data.cover_photo_url,
    bannerPhotoUrl: data.banner_photo_url,
    startDateTimestamp: data.start_date_timestamp,
    endDateTimestamp: data.end_date_timestamp,
    primaryDestinationCountry: data.primary_destination_country,
    primaryDestinationCity: data.primary_destination_city,
    status: data.status.toLowerCase(), // Ensure lowercase for UI consistency
    visibility: data.visibility.toLowerCase(),
});

export const tripService = {
    getAll: async () => {
        const response = await api.get('/trips/');

        // Safety check: if response.data is array
        if (Array.isArray(response.data)) {
            return response.data.map(mapTripResponse);
        }
        // If paginated { items: [...] }
        if (response.data.items && Array.isArray(response.data.items)) {
            return response.data.items.map(mapTripResponse);
        }
        return [];
    },

    create: async (data: CreateTripData) => {
        // Map Camel to Snake for API
        const payload = {
            name: data.name,
            description: data.description,
            start_date_timestamp: data.startDateTimestamp,
            end_date_timestamp: data.endDateTimestamp,
            primary_destination_country: data.primaryDestinationCountry,
            primary_destination_city: data.primaryDestinationCity
        };

        const response = await api.post('/trips/', payload);
        return mapTripResponse(response.data);
    },

    get: async (id: number) => {
        const response = await api.get(`/trips/${id}`);
        return mapTripResponse(response.data);
    },

    delete: async (id: number) => {
        await api.delete(`/trips/${id}`);
    },

    update: async (id: number, data: Partial<CreateTripData> & { visibility?: string }) => {
        const payload: any = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description;
        if (data.startDateTimestamp !== undefined) payload.start_date_timestamp = data.startDateTimestamp;
        if (data.endDateTimestamp !== undefined) payload.end_date_timestamp = data.endDateTimestamp;
        if (data.primaryDestinationCountry !== undefined) payload.primary_destination_country = data.primaryDestinationCountry;
        if (data.primaryDestinationCity !== undefined) payload.primary_destination_city = data.primaryDestinationCity;
        if (data.visibility !== undefined) payload.visibility = data.visibility;
        const response = await api.put(`/trips/${id}`, payload);
        return mapTripResponse(response.data);
    },

    regenerateCover: async (id: number, query?: string) => {
        const url = `/trips/${id}/cover${query ? `?query=${query}` : ''}`;
        const response = await api.patch(url);
        return mapTripResponse(response.data);
    },
    regenerateBanner: async (id: number, query?: string) => {
        const url = `/trips/${id}/banner${query ? `?query=${query}` : ''}`;
        const response = await api.patch(url);
        return mapTripResponse(response.data);
    }
};
