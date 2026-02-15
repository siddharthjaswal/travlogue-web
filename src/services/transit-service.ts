import api from '@/lib/api';

export interface Transit {
  id: number;
  tripDayId: number;
  transitMode: string;
  carrier?: string;
  flightNumber?: string;
  fromLocation?: string;
  toLocation?: string;
  departureTime?: number; // unix
  arrivalTime?: number; // unix
  departureTimezone?: string;
  arrivalTimezone?: string;
  durationMinutes?: number;
  confirmationNumber?: string;
  terminal?: string;
  gate?: string;
  seat?: string;
  cost?: number;
  currency?: string;
}

const mapTransit = (data: any): Transit => ({
  id: data.id,
  tripDayId: data.trip_day_id,
  transitMode: data.transit_mode,
  carrier: data.carrier,
  flightNumber: data.flight_number,
  fromLocation: data.from_location,
  toLocation: data.to_location,
  departureTime: data.departure_time,
  arrivalTime: data.arrival_time,
  departureTimezone: data.departure_timezone,
  arrivalTimezone: data.arrival_timezone,
  durationMinutes: data.duration_minutes,
  confirmationNumber: data.confirmation_number,
  terminal: data.terminal,
  gate: data.gate,
  seat: data.seat,
  cost: data.cost,
  currency: data.currency,
});

export const transitService = {
  listByTripDay: async (tripDayId: number): Promise<Transit[]> => {
    const res = await api.get(`/transits/trip-day/${tripDayId}`);
    return (res.data || []).map(mapTransit);
  },
};
