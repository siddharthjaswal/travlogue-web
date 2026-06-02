'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';

interface MarkerData {
    lat: number;
    lng: number;
    kind?: 'activity' | 'stay';
    type?: string;
    title?: string;
    subtitle?: string;
    cost?: number;
    currency?: string;
    notes?: string;
}

interface StyledMapProps {
    center: { lat: number; lng: number } | null;
    marker?: { lat: number; lng: number } | null;
    markers?: MarkerData[];
    path?: { lat: number; lng: number }[];
    paths?: { lat: number; lng: number }[][];
    height?: number;
    onClick?: (lat: number, lng: number) => void;
    rounded?: string;
    className?: string;
}

// Dark, minimal map style — geometry only, so activity markers stay the focus.
// All clutter (road names, transit, POIs, icons) is hidden; only city names remain
// for light orientation.
const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
    // Hide every label by default, then selectively re-enable city names below.
    { elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    // Roads as subtle shapes, no names.
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#171d29' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#222a3a' }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1e14' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
    // Only city / town names, kept dim.
    { featureType: 'administrative.locality', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
];

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

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$',
};
function currencySymbol(code?: string): string {
    if (!code) return '€';
    return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code.toUpperCase() + ' ';
}

function makeInfoWindowContent(m: MarkerData): string {
    const typeLabel = m.type ? m.type.charAt(0).toUpperCase() + m.type.slice(1) : '';
    const costStr = m.cost ? `${currencySymbol(m.currency)}${m.cost}` : '';
    return `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:8px 4px;max-width:220px">
            ${typeLabel ? `<div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#8b949e;margin-bottom:4px">${typeLabel}</div>` : ''}
            <div style="font-size:14px;font-weight:700;color:#e6edf3;line-height:1.3;margin-bottom:${m.subtitle || m.notes ? '4px' : '0'}">${m.title || ''}</div>
            ${m.subtitle ? `<div style="font-size:12px;color:#8b949e;margin-bottom:4px">${m.subtitle}</div>` : ''}
            ${m.notes ? `<div style="font-size:11px;color:#6e7681;line-height:1.4;border-top:1px solid #21262d;padding-top:6px;margin-top:4px">${m.notes}</div>` : ''}
            ${costStr ? `<div style="font-size:12px;font-weight:600;color:#58a6ff;margin-top:6px">${costStr}</div>` : ''}
        </div>
    `;
}

export function StyledMap({ center, marker, markers, path, paths, height, onClick, rounded = 'rounded-xl', className }: StyledMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [mapReady, setMapReady] = useState(false);
    const markersRef = useRef<any[]>([]);
    const pathsRef = useRef<any[]>([]);
    const infoWindowRef = useRef<any>(null);

    // Trigger resize whenever container dimensions change (handles dialog open/close)
    useEffect(() => {
        const container = mapRef.current;
        if (!container) return;
        const observer = new ResizeObserver(() => {
            const map = mapInstanceRef.current;
            if (!map) return;
            const google = (window as any).google;
            if (google?.maps?.event) {
                google.maps.event.trigger(map, 'resize');
            }
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let mounted = true;
        loadGoogleMaps().then((google) => {
            if (!mounted || !mapRef.current || mapInstanceRef.current) return;
            const safeCenter = (Number.isFinite(center?.lat) && Number.isFinite(center?.lng))
                ? center : { lat: 48.8566, lng: 2.3522 };

            mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                center: safeCenter,
                zoom: 13,
                styles: DARK_MAP_STYLE,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
                gestureHandling: 'greedy',
                backgroundColor: '#0d1117',
            });

            infoWindowRef.current = new google.maps.InfoWindow({
                pixelOffset: new google.maps.Size(0, -6),
            });

            if (onClick) {
                mapInstanceRef.current.addListener('click', (e: any) => {
                    onClick(e.latLng.lat(), e.latLng.lng());
                    infoWindowRef.current?.close();
                });
            }

            setMapReady(true);
        }).catch(() => {});
        return () => { mounted = false; };
    }, []);

    // Update markers & paths when data changes
    const updateMap = useCallback(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapReady) return;
        const google = (window as any).google;
        if (!google?.maps) return;

        // Clear old markers/paths
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        pathsRef.current.forEach(p => p.setMap(null));
        pathsRef.current = [];

        const allMarkers = [...(markers || []), ...(marker ? [{ lat: marker.lat, lng: marker.lng }] : [])];
        const allPaths = [...(paths || []), ...(path?.length ? [path] : [])];
        const bounds = new google.maps.LatLngBounds();
        let hasPoints = false;

        // Add markers
        allMarkers.forEach(m => {
            const color = getMarkerColor(m.kind, m.type);
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${color}" stroke="#0d1117" stroke-width="2.5"/></svg>`;
            const icon = {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
                scaledSize: new google.maps.Size(18, 18),
                anchor: new google.maps.Point(9, 9),
            };
            const gm = new google.maps.Marker({ position: { lat: m.lat, lng: m.lng }, map, icon, title: m.title });

            if (m.title) {
                gm.addListener('click', () => {
                    infoWindowRef.current?.setContent(`
                        <div style="background:#161b22;border-radius:12px;overflow:hidden">
                            ${makeInfoWindowContent(m)}
                        </div>
                    `);
                    infoWindowRef.current?.open({ anchor: gm, map });
                });
            }

            markersRef.current.push(gm);
            bounds.extend({ lat: m.lat, lng: m.lng });
            hasPoints = true;
        });

        // Add paths
        allPaths.forEach(pts => {
            if (pts.length < 2) return;
            const poly = new google.maps.Polyline({
                path: pts,
                geodesic: true,
                strokeColor: '#A8A4F2',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 }, offset: '0', repeat: '8px' }],
            });
            poly.setMap(map);
            pathsRef.current.push(poly);
            pts.forEach(p => { bounds.extend(p); hasPoints = true; });
        });

        // Fit bounds, excluding outliers more than ~18km from centroid
        if (hasPoints && !bounds.isEmpty()) {
            const allPts = allMarkers.map(m => ({ lat: m.lat, lng: m.lng }));
            if (allPts.length > 1) {
                const avgLat = allPts.reduce((s, p) => s + p.lat, 0) / allPts.length;
                const avgLng = allPts.reduce((s, p) => s + p.lng, 0) / allPts.length;
                const toRad = (d: number) => d * Math.PI / 180;
                const dist = (a: {lat:number,lng:number}, b: {lat:number,lng:number}) => {
                    const R = 6371;
                    const dLat = toRad(b.lat - a.lat);
                    const dLng = toRad(b.lng - a.lng);
                    const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
                    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
                };
                const core = allPts.filter(p => dist({ lat: avgLat, lng: avgLng }, p) < 18);
                const fitPts = core.length >= 2 ? core : allPts;
                const coreBounds = new google.maps.LatLngBounds();
                fitPts.forEach(p => coreBounds.extend(p));
                map.fitBounds(coreBounds, 48);
            } else {
                map.setCenter({ lat: allPts[0].lat, lng: allPts[0].lng });
                map.setZoom(14);
            }
        } else {
            const safeCenter = (Number.isFinite(center?.lat) && Number.isFinite(center?.lng))
                ? center : { lat: 48.8566, lng: 2.3522 };
            map.setCenter(safeCenter);
            map.setZoom(13);
        }
    }, [markers, marker, path, paths, center, mapReady]);

    useEffect(() => { updateMap(); }, [updateMap]);

    // Inject glass-morph styles for Google Maps zoom controls once per page
    useEffect(() => {
        if (!mapReady) return;
        if (document.getElementById('gm-zoom-glass')) return;
        const style = document.createElement('style');
        style.id = 'gm-zoom-glass';
        style.textContent = `
            .gm-bundled-control > div {
                background: rgba(13, 17, 23, 0.55) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 10px !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45) !important;
                overflow: hidden !important;
            }
            .gm-bundled-control button.gm-control-active {
                background: transparent !important;
            }
            .gm-bundled-control button.gm-control-active:hover {
                background: rgba(255, 255, 255, 0.07) !important;
            }
            .gm-bundled-control button.gm-control-active img {
                filter: invert(0.75) brightness(1.3) !important;
            }
            .gm-bundled-control > div > div {
                background: rgba(255, 255, 255, 0.08) !important;
            }
            /* Dark info window chrome */
            .gm-style-iw.gm-style-iw-c {
                background: #161b22 !important;
                border: 1px solid rgba(255,255,255,0.08) !important;
                border-radius: 12px !important;
                box-shadow: 0 8px 28px rgba(0,0,0,0.55) !important;
                padding: 0 !important;
            }
            .gm-style-iw-d {
                overflow: hidden !important;
                background: #161b22 !important;
            }
            .gm-style-iw-tc::after {
                background: #161b22 !important;
            }
            .gm-style-iw button.gm-ui-hover-effect {
                top: 2px !important;
                right: 2px !important;
            }
            .gm-style-iw button.gm-ui-hover-effect > span {
                background-color: #6e7681 !important;
            }
        `;
        document.head.appendChild(style);
    }, [mapReady]);

    return (
        <div
            ref={mapRef}
            className={`${rounded} overflow-hidden border border-border/30 ${className || ''}`}
            style={height ? { height } : { height: '100%', width: '100%' }}
        />
    );
}
