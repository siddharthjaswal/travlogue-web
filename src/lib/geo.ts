export function parseLatLng(value?: string) {
  if (!value) return null;
  const match = value.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!match) return null;
  return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
}

// Expanded free dataset (common travel cities)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Europe
  rome: { lat: 41.9028, lng: 12.4964 },
  milan: { lat: 45.4642, lng: 9.19 },
  venice: { lat: 45.4408, lng: 12.3155 },
  florence: { lat: 43.7696, lng: 11.2558 },
  naples: { lat: 40.8518, lng: 14.2681 },
  paris: { lat: 48.8566, lng: 2.3522 },
  lyon: { lat: 45.764, lng: 4.8357 },
  london: { lat: 51.5074, lng: -0.1278 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  berlin: { lat: 52.52, lng: 13.405 },
  munich: { lat: 48.1351, lng: 11.582 },
  hamburg: { lat: 53.5511, lng: 9.9937 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  brussels: { lat: 50.8503, lng: 4.3517 },
  zurich: { lat: 47.3769, lng: 8.5417 },
  vienna: { lat: 48.2082, lng: 16.3738 },
  prague: { lat: 50.0755, lng: 14.4378 },
  budapest: { lat: 47.4979, lng: 19.0402 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  porto: { lat: 41.1579, lng: -8.6291 },
  athens: { lat: 37.9838, lng: 23.7275 },
  dublin: { lat: 53.3498, lng: -6.2603 },
  stockholm: { lat: 59.3293, lng: 18.0686 },
  oslo: { lat: 59.9139, lng: 10.7522 },
  copenhagen: { lat: 55.6761, lng: 12.5683 },

  // North America
  nyc: { lat: 40.7128, lng: -74.006 },
  newyork: { lat: 40.7128, lng: -74.006 },
  boston: { lat: 42.3601, lng: -71.0589 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  sanfrancisco: { lat: 37.7749, lng: -122.4194 },
  losangeles: { lat: 34.0522, lng: -118.2437 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  miami: { lat: 25.7617, lng: -80.1918 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
  montreal: { lat: 45.5017, lng: -73.5673 },

  // South America
  rio: { lat: -22.9068, lng: -43.1729 },
  saopaulo: { lat: -23.5505, lng: -46.6333 },
  buenosaires: { lat: -34.6037, lng: -58.3816 },
  lima: { lat: -12.0464, lng: -77.0428 },

  // Asia
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  goa: { lat: 15.2993, lng: 74.124 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  abuDhabi: { lat: 24.4539, lng: 54.3773 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  seoul: { lat: 37.5665, lng: 126.978 },
  beijing: { lat: 39.9042, lng: 116.4074 },
  shanghai: { lat: 31.2304, lng: 121.4737 },
  hongkong: { lat: 22.3193, lng: 114.1694 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  kualalumpur: { lat: 3.139, lng: 101.6869 },

  // Oceania
  sydney: { lat: -33.8688, lng: 151.2093 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
  auckland: { lat: -36.8485, lng: 174.7633 },

  // Africa
  cairo: { lat: 30.0444, lng: 31.2357 },
  capeTown: { lat: -33.9249, lng: 18.4241 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
};

const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  italy: { lat: 41.8719, lng: 12.5674 },
  france: { lat: 46.2276, lng: 2.2137 },
  germany: { lat: 51.1657, lng: 10.4515 },
  spain: { lat: 40.4637, lng: -3.7492 },
  india: { lat: 20.5937, lng: 78.9629 },
  usa: { lat: 37.0902, lng: -95.7129 },
  uk: { lat: 55.3781, lng: -3.436 },
  unitedkingdom: { lat: 55.3781, lng: -3.436 },
  canada: { lat: 56.1304, lng: -106.3468 },
  japan: { lat: 36.2048, lng: 138.2529 },
  china: { lat: 35.8617, lng: 104.1954 },
  australia: { lat: -25.2744, lng: 133.7751 },
  brazil: { lat: -14.235, lng: -51.9253 },
  argentina: { lat: -38.4161, lng: -63.6167 },
  uae: { lat: 23.4241, lng: 53.8478 },
  singapore: { lat: 1.3521, lng: 103.8198 },
};

export function guessCenter(city?: string, country?: string) {
  if (city) {
    const key = city.toLowerCase().replace(/\s+/g, "");
    if (CITY_COORDS[key]) return CITY_COORDS[key];
  }
  if (country) {
    const key = country.toLowerCase().replace(/\s+/g, "");
    if (COUNTRY_COORDS[key]) return COUNTRY_COORDS[key];
  }
  return { lat: 20, lng: 0 }; // fallback
}
