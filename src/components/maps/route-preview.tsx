'use client';

import { useMemo } from 'react';

interface RoutePreviewProps {
    /** Ordered [lat, lng] points along the route (≥2). */
    geometry: [number, number][];
    color?: string;
    height?: number;
    className?: string;
}

/**
 * Lightweight, free route preview — draws the path geometry as an SVG (no map
 * tiles, no API). Aspect-correct (longitude compressed by latitude) so the
 * shape reads like the real route. Endpoints marked with dots.
 */
export function RoutePreview({ geometry, color = 'var(--primary)', height = 72, className }: RoutePreviewProps) {
    const { d, start, end } = useMemo(() => {
        const W = 280;
        const H = height;
        const pad = 12;

        const lats = geometry.map((p) => p[0]);
        const lngs = geometry.map((p) => p[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const midLat = (minLat + maxLat) / 2;

        // Project to roughly-equal units: longitude shrinks with latitude.
        const lngScale = Math.max(0.01, Math.cos((midLat * Math.PI) / 180));
        const px = (lng: number) => (lng - minLng) * lngScale;
        const spanX = Math.max(1e-9, (maxLng - minLng) * lngScale);
        const spanY = Math.max(1e-9, maxLat - minLat);

        const scale = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
        const offX = (W - spanX * scale) / 2;
        const offY = (H - spanY * scale) / 2;

        const X = (lng: number) => offX + px(lng) * scale;
        const Y = (lat: number) => H - (offY + (lat - minLat) * scale); // flip: north is up

        const path = geometry
            .map((p, i) => `${i ? 'L' : 'M'}${X(p[1]).toFixed(1)},${Y(p[0]).toFixed(1)}`)
            .join(' ');

        const s = geometry[0];
        const e = geometry[geometry.length - 1];
        return {
            d: path,
            start: { x: X(s[1]), y: Y(s[0]) },
            end: { x: X(e[1]), y: Y(e[0]) },
        };
    }, [geometry, height]);

    return (
        <svg
            viewBox={`0 0 280 ${height}`}
            className={className}
            style={{ width: '100%', height }}
            aria-hidden
        >
            {/* faint glow under the line */}
            <path d={d} fill="none" stroke={color} strokeWidth={6} strokeOpacity={0.12} strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {/* start dot */}
            <circle cx={start.x} cy={start.y} r={4.5} fill={color} stroke="var(--card)" strokeWidth={1.5} />
            {/* end dot */}
            <circle cx={end.x} cy={end.y} r={4.5} fill="var(--card)" stroke={color} strokeWidth={2.5} />
        </svg>
    );
}
