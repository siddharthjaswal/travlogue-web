import { describe, it, expect } from 'vitest';
import {
    guessCenter,
    resolveDestinationCoords,
    parseLatLng,
    parseGoogleMapsLink,
} from './geo';

describe('parseLatLng', () => {
    it('extracts coordinates from "lat, lng" text', () => {
        expect(parseLatLng('64.13548, -21.89541')).toEqual({ lat: 64.13548, lng: -21.89541 });
    });

    it('returns null for non-coordinate text', () => {
        expect(parseLatLng('Reykjavik, Iceland')).toBeNull();
        expect(parseLatLng(undefined)).toBeNull();
    });
});

describe('parseGoogleMapsLink', () => {
    it('extracts @lat,lng from a maps URL', () => {
        const r = parseGoogleMapsLink('https://www.google.com/maps/place/Foo/@48.8566,2.3522,15z');
        expect(r?.lat).toBeCloseTo(48.8566);
        expect(r?.lng).toBeCloseTo(2.3522);
    });

    it('returns null for non-google URLs', () => {
        expect(parseGoogleMapsLink('https://example.com')).toBeNull();
    });
});

describe('guessCenter (sync hardcoded table)', () => {
    it('knows common cities', () => {
        expect(guessCenter('Paris')).toEqual({ lat: 48.8566, lng: 2.3522 });
    });

    it('returns null for places not in the table (e.g. Iceland)', () => {
        // Regression: this used to return {lat:20,lng:0} (ocean), causing the
        // 33°C weather bug. It must return null so callers fall back to CSC.
        expect(guessCenter(undefined, 'Iceland')).toBeNull();
        expect(guessCenter('Reykjavik', 'Iceland')).toBeNull();
    });
});

describe('resolveDestinationCoords (async, country-state-city fallback)', () => {
    it('resolves Iceland to its real coordinates, not the ocean fallback', async () => {
        const coords = await resolveDestinationCoords(undefined, 'Iceland');
        expect(coords).not.toBeNull();
        // Iceland is ~65°N, -18°W — definitively not Paris (48,2) or {20,0}.
        expect(coords!.lat).toBeGreaterThan(60);
        expect(coords!.lng).toBeLessThan(-10);
    });

    it('resolves a city with accent-insensitive matching (Reykjavik → Reykjavík)', async () => {
        const coords = await resolveDestinationCoords('Reykjavik', 'Iceland');
        expect(coords).not.toBeNull();
        expect(coords!.lat).toBeCloseTo(64.14, 1);
        expect(coords!.lng).toBeCloseTo(-21.9, 1);
    });

    it('returns null when nothing matches', async () => {
        expect(await resolveDestinationCoords(undefined, undefined)).toBeNull();
        expect(await resolveDestinationCoords(undefined, 'Notacountryland')).toBeNull();
    });
});
