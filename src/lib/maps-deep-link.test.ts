import { describe, it, expect } from 'vitest';
import {
    hasDirections,
    googleDirectionsUrl,
    appleDirectionsUrl,
    googlePlaceUrl,
} from './maps-deep-link';

const BCN = { lat: 41.3851, lng: 2.1734, label: 'Barcelona' };
const CDG = { lat: 49.0097, lng: 2.5479, label: 'Paris CDG' };

describe('hasDirections', () => {
    it('true when both points have coords or labels', () => {
        expect(hasDirections(BCN, CDG)).toBe(true);
        expect(hasDirections({ label: 'A' }, { label: 'B' })).toBe(true);
    });
    it('false when a point is empty', () => {
        expect(hasDirections(BCN, { lat: null, lng: null })).toBe(false);
        expect(hasDirections(null, CDG)).toBe(false);
    });
});

describe('googleDirectionsUrl', () => {
    it('builds a universal directions URL with coords + travelmode', () => {
        const url = googleDirectionsUrl(BCN, CDG, 'car')!;
        expect(url).toContain('https://www.google.com/maps/dir/?');
        expect(url).toContain('api=1');
        expect(url).toContain('origin=41.3851');
        expect(url).toContain('destination=49.0097');
        expect(url).toContain('travelmode=driving');
    });
    it('maps train/bus/ferry/flight → transit', () => {
        for (const m of ['train', 'bus', 'ferry', 'flight']) {
            expect(googleDirectionsUrl(BCN, CDG, m)).toContain('travelmode=transit');
        }
    });
    it('falls back to labels when coords are missing', () => {
        const url = googleDirectionsUrl({ label: 'Rome' }, { label: 'Milan' }, 'walk')!;
        expect(url).toContain('origin=Rome');
        expect(url).toContain('destination=Milan');
        expect(url).toContain('travelmode=walking');
    });
    it('returns null without a usable endpoint', () => {
        expect(googleDirectionsUrl({}, CDG)).toBeNull();
    });
});

describe('appleDirectionsUrl', () => {
    it('uses dirflg per mode', () => {
        expect(appleDirectionsUrl(BCN, CDG, 'car')).toContain('dirflg=d');
        expect(appleDirectionsUrl(BCN, CDG, 'train')).toContain('dirflg=r');
        expect(appleDirectionsUrl(BCN, CDG, 'walk')).toContain('saddr=41.3851');
    });
});

describe('googlePlaceUrl', () => {
    it('builds a place search URL', () => {
        expect(googlePlaceUrl(BCN)).toContain('https://www.google.com/maps/search/?api=1&query=');
        expect(googlePlaceUrl({ label: 'Eiffel Tower' })).toContain('query=Eiffel%20Tower');
    });
});
