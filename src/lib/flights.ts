import { Duffel } from '@duffel/api';

export const duffel = new Duffel({
  token: process.env.DUFFEL_API_KEY!,
});

export interface FlightSearchParams {
  origin: string;        // IATA airport code e.g. "LHR"
  destination: string;   // IATA airport code e.g. "CDG"
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;   // YYYY-MM-DD (omit for one-way)
  passengers?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface FlightOffer {
  id: string;
  totalAmount: string;
  totalCurrency: string;
  slices: FlightSlice[];
  validUntil: string;
  owner: { name: string; logoUrl: string | null };
  passengerCount: number;
}

export interface FlightSlice {
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  duration: string;
  segments: FlightSegment[];
  stops: number;
}

export interface FlightSegment {
  airline: string;
  flightNumber: string;
  aircraft: string;
  departureAt: string;
  arrivalAt: string;
  duration: string;
  origin: string;
  destination: string;
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : '';
  const m = match[2] ? ` ${match[2]}m` : '';
  return `${h}${m}`.trim();
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const slices: any[] = [
    {
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
    },
  ];

  if (params.returnDate) {
    slices.push({
      origin: params.destination,
      destination: params.origin,
      departure_date: params.returnDate,
    });
  }

  const passengers = Array.from({ length: params.passengers ?? 1 }, () => ({
    type: 'adult' as const,
  }));

  const offerRequest = await duffel.offerRequests.create({
    slices,
    passengers,
    cabin_class: params.cabinClass ?? 'economy',
    return_offers: false,
  });

  const offers = await duffel.offers.list({
    offer_request_id: offerRequest.data.id,
    limit: 10,
    sort: 'total_amount',
  });

  return offers.data.map(offer => ({
    id: offer.id,
    totalAmount: offer.total_amount,
    totalCurrency: offer.total_currency,
    validUntil: offer.expires_at ?? '',
    owner: {
      name: offer.owner.name,
      logoUrl: offer.owner.logo_symbol_url ?? null,
    },
    passengerCount: params.passengers ?? 1,
    slices: offer.slices.map(slice => ({
      origin: slice.origin.iata_code,
      destination: slice.destination.iata_code,
      departureAt: slice.segments[0].departing_at,
      arrivalAt: slice.segments[slice.segments.length - 1].arriving_at,
      duration: parseDuration(slice.duration ?? ''),
      stops: slice.segments.length - 1,
      segments: slice.segments.map(seg => ({
        airline: seg.operating_carrier.name,
        flightNumber: `${seg.operating_carrier.iata_code}${seg.operating_carrier_flight_number}`,
        aircraft: seg.aircraft?.name ?? '',
        departureAt: seg.departing_at,
        arrivalAt: seg.arriving_at,
        duration: parseDuration(seg.duration ?? ''),
        origin: seg.origin.iata_code,
        destination: seg.destination.iata_code,
      })),
    })),
  }));
}
