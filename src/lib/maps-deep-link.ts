// Build deep links that open native Maps apps (Google / Apple) for directions
// or a single place. Free, keyless, cross-platform. No API calls.

export interface GeoPoint {
    lat?: number | null;
    lng?: number | null;
    label?: string | null;
}

// Our transport modes → Google Maps `travelmode`
const GOOGLE_TRAVELMODE: Record<string, string> = {
    car: 'driving',
    walk: 'walking',
    bicycle: 'bicycling',
    cycle: 'bicycling',
    train: 'transit',
    bus: 'transit',
    ferry: 'transit',
    flight: 'transit', // Google surfaces flights under transit for long distances
};

// Our transport modes → Apple Maps `dirflg`
const APPLE_DIRFLG: Record<string, string> = {
    car: 'd',
    walk: 'w',
    bicycle: 'c',
    cycle: 'c',
    train: 'r',
    bus: 'r',
    ferry: 'r',
    flight: 'r',
};

/** A usable origin/destination param: prefer "lat,lng", fall back to a label. */
function pointParam(p?: GeoPoint | null): string | null {
    if (!p) return null;
    if (
        p.lat != null &&
        p.lng != null &&
        Number.isFinite(Number(p.lat)) &&
        Number.isFinite(Number(p.lng))
    ) {
        return `${Number(p.lat)},${Number(p.lng)}`;
    }
    if (p.label && p.label.trim()) return p.label.trim();
    return null;
}

/** True if we have enough to build a directions link. */
export function hasDirections(from?: GeoPoint | null, to?: GeoPoint | null): boolean {
    return !!(pointParam(from) && pointParam(to));
}

/** Google Maps universal directions URL (opens the native app on mobile). */
export function googleDirectionsUrl(from: GeoPoint, to: GeoPoint, mode?: string | null): string | null {
    const origin = pointParam(from);
    const destination = pointParam(to);
    if (!origin || !destination) return null;
    const params = new URLSearchParams({ api: '1', origin, destination });
    const tm = GOOGLE_TRAVELMODE[(mode || '').toLowerCase()];
    if (tm) params.set('travelmode', tm);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Apple Maps directions URL. */
export function appleDirectionsUrl(from: GeoPoint, to: GeoPoint, mode?: string | null): string | null {
    const saddr = pointParam(from);
    const daddr = pointParam(to);
    if (!saddr || !daddr) return null;
    const params = new URLSearchParams({ saddr, daddr });
    const fl = APPLE_DIRFLG[(mode || '').toLowerCase()];
    if (fl) params.set('dirflg', fl);
    return `https://maps.apple.com/?${params.toString()}`;
}

/**
 * Platform-aware directions URL: Apple Maps on Apple devices, Google elsewhere
 * (Google's link also opens the Google Maps app on iOS/Android). Safe to call
 * during render — falls back to Google when there's no `navigator`.
 */
export function directionsUrl(from: GeoPoint, to: GeoPoint, mode?: string | null): string | null {
    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent || '')) {
        return appleDirectionsUrl(from, to, mode) ?? googleDirectionsUrl(from, to, mode);
    }
    return googleDirectionsUrl(from, to, mode);
}

/** Open a single place (lat/lng or label) in Google Maps. */
export function googlePlaceUrl(p: GeoPoint): string | null {
    const query = pointParam(p);
    if (!query) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
