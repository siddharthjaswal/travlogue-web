import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/weather';

export const revalidate = 3600; // cache 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const days = parseInt(searchParams.get('days') ?? '7');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    const weather = await fetchWeather(lat, lng, days);
    return NextResponse.json(weather, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
