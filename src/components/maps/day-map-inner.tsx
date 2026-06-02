'use client';

import { useEffect, useRef } from 'react';

export interface DayMarker {
    lat: number;
    lng: number;
    type: string;
    name: string;
    time?: string;
    index: number;
}

const TYPE_COLORS: Record<string, string> = {
    sightseeing:    '#7FD1C8',
    cultural:       '#7FD1C8',
    dining:         '#F2A477',
    adventure:      '#9DD49A',
    sports:         '#9DD49A',
    transportation: '#A8A4F2',
    entertainment:  '#F2A477',
    nightlife:      '#F2A477',
    relaxation:     '#8FB7FF',
    shopping:       '#C5B8A5',
    other:          '#C5B8A5',
};

function typeColor(type: string): string {
    return TYPE_COLORS[(type || '').toLowerCase()] ?? TYPE_COLORS.other;
}

interface DayMapInnerProps {
    markers: DayMarker[];
    height?: number;
}

export default function DayMapInner({ markers, height = 220 }: DayMapInnerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef      = useRef<any>(null);
    const layersRef   = useRef<any[]>([]);

    // Initialise map once
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        const L = require('leaflet');

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/leaflet/marker-icon-2x.png',
            iconUrl:       '/leaflet/marker-icon.png',
            shadowUrl:     '/leaflet/marker-shadow.png',
        });

        const map = L.map(containerRef.current, {
            zoomControl:      false,
            attributionControl: false,
            scrollWheelZoom:  false,
            center:           [markers[0]?.lat ?? 0, markers[0]?.lng ?? 0],
            zoom:             12,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom:    19,
        }).addTo(map);

        // Minimal zoom control, bottom-right, out of the way
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapRef.current = map;

        // Eagerly invalidate so the map fills the container even when the
        // parent grid hasn't fully settled at the time Leaflet initialised.
        map.invalidateSize();
        setTimeout(() => map.invalidateSize(), 0);
        setTimeout(() => map.invalidateSize(), 80);
        setTimeout(() => map.invalidateSize(), 250);

        return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-draw whenever markers change
    useEffect(() => {
        const map = mapRef.current;
        if (!map || markers.length === 0) return;
        const L = require('leaflet');

        // Remove previous custom layers
        layersRef.current.forEach(l => l.remove());
        layersRef.current = [];

        const bounds: [number, number][] = [];

        // Route polyline — subtle dashed line connecting stops in order
        if (markers.length >= 2) {
            const latlngs = markers.map(m => [m.lat, m.lng] as [number, number]);
            const poly = L.polyline(latlngs, {
                color:     'rgba(148,163,184,0.35)',
                weight:    2,
                dashArray: '5,6',
            });
            poly.addTo(map);
            layersRef.current.push(poly);
        }

        // Numbered colour-coded markers
        markers.forEach((m) => {
            const color = typeColor(m.type);
            const num   = m.index + 1;

            const icon = L.divIcon({
                className: '',
                html: `<div style="
                    width:22px;height:22px;border-radius:50%;
                    background:${color};
                    border:2px solid rgba(255,255,255,0.2);
                    box-shadow:0 2px 8px rgba(0,0,0,0.55);
                    display:flex;align-items:center;justify-content:center;
                    color:rgba(0,0,0,0.75);font-size:9px;font-weight:800;
                    font-family:system-ui,sans-serif;line-height:1;
                ">${num}</div>`,
                iconSize:    [22, 22],
                iconAnchor:  [11, 11],
                popupAnchor: [0, -14],
            });

            const timeStr = m.time
                ? (() => {
                    const [h, mi] = m.time.split(':').map(Number);
                    const h12 = ((h + 11) % 12) + 1;
                    return `${h12}:${String(mi || 0).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
                  })()
                : '';

            const marker = L.marker([m.lat, m.lng], { icon });
            marker.bindPopup(
                `<div class="dm-popup">
                    <div class="dm-popup-name">${m.name}</div>
                    ${timeStr ? `<div class="dm-popup-time">${timeStr}</div>` : ''}
                </div>`,
                { maxWidth: 200, className: 'day-map-popup' }
            );
            marker.addTo(map);
            layersRef.current.push(marker);
            bounds.push([m.lat, m.lng]);
        });

        // Fit to all markers — all stops on a day are intentional, no outlier filtering
        if (bounds.length >= 2) {
            map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 14);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(markers)]);

    // Invalidate size on container resize
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(() => mapRef.current?.invalidateSize({ animate: false }));
        obs.observe(el);
        const t = setTimeout(() => mapRef.current?.invalidateSize({ animate: false }), 150);
        return () => { obs.disconnect(); clearTimeout(t); };
    }, []);

    return <div ref={containerRef} style={{ height, width: '100%' }} />;
}
