export function parseLatLng(value?: string) {
  if (!value) return null;
  const match = value.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!match) return null;
  return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  rome: { lat: 41.9028, lng: 12.4964 },
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  berlin: { lat: 52.52, lng: 13.405 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  milan: { lat: 45.4642, lng: 9.19 },
  naples: { lat: 40.8518, lng: 14.2681 },
  florence: { lat: 43.7696, lng: 11.2558 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  nyc: { lat: 40.7128, lng: -74.006 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
};

const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  italy: { lat: 41.8719, lng: 12.5674 },
  france: { lat: 46.2276, lng: 2.2137 },
  germany: { lat: 51.1657, lng: 10.4515 },
  spain: { lat: 40.4637, lng: -3.7492 },
  india: { lat: 20.5937, lng: 78.9629 },
  usa: { lat: 37.0902, lng: -95.7129 },
  uk: { lat: 55.3781, lng: -3.436 },
};

export function guessCenter(city?: string, country?: string) {
  if (city) {
    const key = city.toLowerCase();
    if (CITY_COORDS[key]) return CITY_COORDS[key];
  }
  if (country) {
    const key = country.toLowerCase();
    if (COUNTRY_COORDS[key]) return COUNTRY_COORDS[key];
  }
  return { lat: 20, lng: 0 }; // fallback
}
