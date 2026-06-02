import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface RouteResult {
    geometry: [number, number][]; // [lat, lng] points along the route
    distance_m: number | null;
    duration_s: number | null;
    source: 'osrm' | 'straight';
}

interface Pt {
    lat: number;
    lng: number;
}

/**
 * Fetch a road route (geometry + distance + duration) between two points via
 * our backend (free OSRM). Cached forever — a route between fixed points
 * doesn't change. Disabled unless both points and `enabled` are provided.
 */
export function useRoute(from?: Pt | null, to?: Pt | null, enabled = true) {
    const key = from && to ? `${from.lat},${from.lng}|${to.lat},${to.lng}` : null;
    return useQuery<RouteResult>({
        queryKey: ['route', key],
        enabled: !!key && enabled,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
        retry: 0,
        queryFn: async () => {
            const res = await api.get<RouteResult>('/utils/route', {
                params: { from: `${from!.lat},${from!.lng}`, to: `${to!.lat},${to!.lng}` },
            });
            return res.data;
        },
    });
}
