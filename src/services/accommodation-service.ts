import api from '@/lib/api';

export interface Accommodation {
  id: number;
  tripDayId: number;
  accommodationType: 'check_in' | 'whole_day' | 'check_out';
  checkInTime?: number | null;
  checkOutTime?: number | null;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  confirmationNumber?: string | null;
  bookingUrl?: string | null;
  cost?: number | null;
  currency?: string;
  notes?: string | null;
  roomType?: string | null;
}

export interface CreateAccommodationData {
  tripId: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  checkInTime?: number | null; // unix seconds
  checkOutTime?: number | null; // unix seconds
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cost?: number | null;
  currency?: string;
  notes?: string | null;
}

const mapAccommodation = (data: any): Accommodation => ({
  id: data.id,
  tripDayId: data.trip_day_id,
  accommodationType: data.accommodation_type,
  checkInTime: data.check_in_time,
  checkOutTime: data.check_out_time,
  name: data.name,
  address: data.address,
  latitude: data.latitude,
  longitude: data.longitude,
  confirmationNumber: data.confirmation_number,
  bookingUrl: data.booking_url,
  cost: data.cost,
  currency: data.currency,
  notes: data.notes,
  roomType: data.room_type,
});

export const accommodationService = {
  create: async (data: CreateAccommodationData): Promise<Accommodation[]> => {
    const payload = {
      trip_id: data.tripId,
      check_in_date: data.checkInDate,
      check_out_date: data.checkOutDate,
      check_in_time: data.checkInTime ?? null,
      check_out_time: data.checkOutTime ?? null,
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      cost: data.cost ?? undefined,
      currency: data.currency || 'USD',
      notes: data.notes,
    };

    const response = await api.post('/accommodations/', payload);
    return (response.data || []).map(mapAccommodation);
  },

  listByTrip: async (tripId: number): Promise<Accommodation[]> => {
    const response = await api.get(`/accommodations/trip/${tripId}`);
    return (response.data || []).map(mapAccommodation);
  },
};
