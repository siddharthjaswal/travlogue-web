import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/flights';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, passengers, cabinClass } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'origin, destination, and departureDate are required' },
        { status: 400 }
      );
    }

    const offers = await searchFlights({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate,
      passengers: passengers ?? 1,
      cabinClass: cabinClass ?? 'economy',
    });

    return NextResponse.json({ offers });
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ??
      err?.message ??
      'Flight search failed';
    console.error('Duffel flight search error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
