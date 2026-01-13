import api from '@/lib/api';

export interface CreateTripDayData {
    tripId: number;
    date: string; // YYYY-MM-DD
    dayNumber: number;
    place: string;
    title?: string;
    placeCountry?: string;
    placeCity?: string;
}

export interface TripDay {
    id: number;
    tripId: number;
    date: string;
    dayNumber: number;
    dayType: string;
    title?: string;
    place: string;
}

const mapTripDay = (data: any): TripDay => ({
    id: data.id,
    tripId: data.trip_id,
    date: data.date,
    dayNumber: data.day_number,
    dayType: data.day_type,
    title: data.title,
    place: data.place,
});

export const tripDayService = {
    create: async (data: CreateTripDayData): Promise<TripDay> => {
        const payload = {
            trip_id: data.tripId,
            date: data.date,
            day_number: data.dayNumber,
            place: data.place,
            title: data.title,
            place_country: data.placeCountry,
            place_city: data.placeCity,
        };
        const response = await api.post('/trip-days/', payload);
        return mapTripDay(response.data);
    },
};
