'use client';

import { useEffect, useRef } from 'react';
// leaflet.css is imported globally in layout.tsx

interface MarkerData {
    lat: number;
    lng: number;
    kind?: 'activity' | 'stay';
    type?: string;
    title?: string;
    subtitle?: string;
}

interface LeafletMapInnerProps {
    center: { lat: number; lng: number };
    markers?: MarkerData[];
    paths?: { lat: number; lng: number }[][];
    height?: number;
    className?: string;
}

const MARKER_COLORS: Record<string, string> = {
    sightseeing: '#7FD1C8',
    dining: '#F2A477',
    transportation: '#A8A4F2',
    stay: '#8FB7FF',
    other: '#C5B8A5',
    default: '#9BB6D4',
};

function getMarkerColor(kind?: string, type?: string): string {
    if (kind === 'stay') return MARKER_COLORS.stay;
    const t = (type || '').toLowerCase();
    for (const key of Object.keys(MARKER_COLORS)) {
        if (t.includes(key)) return MARKER_COLORS[key];
    }
    return MARKER_COLORS.default;
}

function createMarkerIcon(L: any, color: string) {
    return L.divIcon({
        className: '',
        html: `<div style="
            width:14px;height:14px;
            border-radius:50%;
            background:${color};
            border:2px solid #5F6E84;
            box-shadow:0 2px 6px rgba(0,0,0,0.45);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10],
    });
}

export default function LeafletMapInner({ center, markers, paths, height, className }: LeafletMapInnerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const pathsRef = useRef<any[]>([]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const L = require('leaflet');

        // Fix default marker icons (leaflet asset path issue)
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/leaflet/marker-icon-2x.png',
            iconUrl: '/leaflet/marker-icon.png',
            shadowUrl: '/leaflet/marker-shadow.png',
        });

        const map = L.map(containerRef.current, {
            center: [center.lat, center.lng],
            zoom: 12,
            zoomControl: true,
            attributionControl: true,
        });

        // CartoDB Dark Matter tiles — free, no API key, beautiful dark style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const L = require('leaflet');

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        pathsRef.current.forEach(p => p.remove());
        pathsRef.current = [];

        const bounds: [number, number][] = [];

        if (markers && markers.length > 0) {
            markers.forEach(m => {
                const color = getMarkerColor(m.kind, m.type);
                const icon = createMarkerIcon(L, color);
                const marker = L.marker([m.lat, m.lng], { icon });
                if (m.title || m.subtitle) {
                    marker.bindPopup(`
                        <div style="font-family:system-ui;padding:4px 2px;min-width:120px">
                            ${m.title ? `<div style="font-weight:600;margin-bottom:2px">${m.title}</div>` : ''}
                            ${m.subtitle ? `<div style="color:#9ca3af;font-size:11px">${m.subtitle}</div>` : ''}
                        </div>
                    `);
                }
                marker.addTo(map);
                markersRef.current.push(marker);
                bounds.push([m.lat, m.lng]);
            });
        }

        if (paths && paths.length > 0) {
            paths.forEach(path => {
                if (path.length < 2) return;
                const latlngs = path.map(p => [p.lat, p.lng] as [number, number]);
                const poly = L.polyline(latlngs, {
                    color: '#A8A4F2',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '6,4',
                });
                poly.addTo(map);
                pathsRef.current.push(poly);
                latlngs.forEach(ll => bounds.push(ll));
            });
        }

        if (bounds.length > 1) {
            // Filter out outlier points more than ~30km from the centroid
            // (e.g. airport transfers pulling map too far out)
            const avgLat = bounds.reduce((s, p) => s + p[0], 0) / bounds.length;
            const avgLng = bounds.reduce((s, p) => s + p[1], 0) / bounds.length;
            const toRad = (d: number) => d * Math.PI / 180;
            const haversine = (a: [number,number], b: [number,number]) => {
                const R = 6371;
                const dLat = toRad(b[0] - a[0]);
                const dLng = toRad(b[1] - a[1]);
                const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLng/2)**2;
                return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
            };
            const corePoints = bounds.filter(p => haversine([avgLat, avgLng], p) < 18);
            const fitPoints = corePoints.length >= 2 ? corePoints : bounds;
            map.fitBounds(fitPoints, { padding: [48, 48], maxZoom: 14 });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 14);
        } else {
            map.setView([center.lat, center.lng], 13);
        }
    }, [JSON.stringify(markers), JSON.stringify(paths)]);

    // Sync center when no markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map || (markers && markers.length > 0)) return;
        map.setView([center.lat, center.lng], 12);
    }, [center.lat, center.lng]);

    // Invalidate size whenever container changes dimensions (handles dialog open, resize, etc.)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver(() => {
            mapRef.current?.invalidateSize({ animate: false });
        });
        observer.observe(container);
        // Also fire once after a short delay for initial render
        const t = setTimeout(() => mapRef.current?.invalidateSize({ animate: false }), 200);
        return () => { observer.disconnect(); clearTimeout(t); };
    }, []);

    return (
        <div
            ref={containerRef}
            className={className}
            style={height ? { height } : { height: '100%', width: '100%' }}
        />
    );
}
