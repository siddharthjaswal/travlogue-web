'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import { TRAVEL_MAP_STYLE } from '@/lib/map-theme';

interface StyledMapProps {
  center: { lat: number; lng: number };
  marker?: { lat: number; lng: number } | null;
  markers?: { lat: number; lng: number; kind?: 'activity' | 'stay'; type?: string; title?: string; subtitle?: string }[];
  path?: { lat: number; lng: number }[];
  paths?: { lat: number; lng: number }[][];
  height?: number;
  onClick?: (lat: number, lng: number) => void;
  rounded?: string;
  className?: string;
}

export function StyledMap({ center, marker, markers, path, paths, height, onClick, rounded = 'rounded-xl', className }: StyledMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const markerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const pathRef = useRef<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((google) => {
        if (!mapRef.current || mapInstanceRef.current || !isMounted) return;

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          styles: TRAVEL_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        });
        setMapReady(true);

        if (onClick) {
          mapInstanceRef.current.addListener('click', (e: any) => {
            onClick(e.latLng.lat(), e.latLng.lng());
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [center.lat, center.lng, onClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !marker) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: marker,
        map: mapInstanceRef.current,
      });
    } else {
      markerRef.current.setPosition(marker);
    }

    mapInstanceRef.current.setCenter(marker);
    mapInstanceRef.current.setZoom(15);
  }, [marker?.lat, marker?.lng]);

  const getMarkerSvg = (kind?: 'activity' | 'stay', type?: string) => {
    const t = (type || '').toLowerCase();
    const isStay = kind === 'stay';

    let fill = '#9BB6D4';
    if (isStay) fill = '#A5BBD6';
    else if (t.includes('sightseeing')) fill = '#8FA6C8';
    else if (t.includes('dining')) fill = '#C8A38C';
    else if (t.includes('transport')) fill = '#7C97C9';
    else if (t.includes('other')) fill = '#A5BBD6';
    else fill = '#9AA8BC';

    const stroke = '#5F6E84';

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" fill="${fill}" stroke="${stroke}" stroke-width="2" />
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    // Clear existing multi markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    if (markers && markers.length > 0) {
      markers.forEach((m) => {
        const iconUrl = getMarkerSvg(m.kind, m.type);
        const marker = new google.maps.Marker({
          position: { lat: m.lat, lng: m.lng },
          map: mapInstanceRef.current,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(12, 12),
            anchor: new google.maps.Point(6, 6),
          },
        });

        if (m.title || m.subtitle) {
          marker.addListener('click', () => {
            const title = m.title ? `<div style="font-weight:600; margin-bottom:4px;">${m.title}</div>` : '';
            const subtitle = m.subtitle ? `<div style="color:#6b7280; font-size:12px;">${m.subtitle}</div>` : '';
            infoWindow.setContent(`<div style="font-family:Inter,system-ui; padding:4px 2px;">${title}${subtitle}</div>`);
            infoWindow.open({ anchor: marker, map: mapInstanceRef.current });
          });
        }

        markersRef.current.push(marker);
        bounds.extend({ lat: m.lat, lng: m.lng });
      });
    }

    if (pathRef.current.length) {
      pathRef.current.forEach((p) => p.setMap(null));
      pathRef.current = [];
    }

    const allPaths = paths && paths.length ? paths : (path && path.length ? [path] : []);
    if (allPaths.length) {
      allPaths.forEach((pathItem) => {
        if (pathItem.length < 2) return;
        const poly = new google.maps.Polyline({
          path: pathItem,
          geodesic: true,
          strokeColor: '#7C97C9',
          strokeOpacity: 0.7,
          strokeWeight: 2,
          icons: [
            {
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
              offset: '0',
              repeat: '8px',
            },
          ],
        });
        poly.setMap(mapInstanceRef.current);
        pathItem.forEach((p) => bounds.extend(p));
        pathRef.current.push(poly);
      });
    }

    if (!bounds.isEmpty()) {
      const pathPointCount = allPaths.reduce((acc, p) => acc + p.length, 0);
      if ((markers?.length || 0) + pathPointCount <= 1) {
        mapInstanceRef.current.setCenter(bounds.getCenter());
        mapInstanceRef.current.setZoom(15);
      } else {
        mapInstanceRef.current.fitBounds(bounds, 80);
      }
    }
  }, [markers?.length, JSON.stringify(markers), JSON.stringify(path), JSON.stringify(paths), mapReady]);

  return (
    <div
      ref={mapRef}
      className={`${rounded} overflow-hidden border border-border/30 ${className || ''}`}
      style={height ? { height } : { height: '100%', width: '100%' }}
    />
  );
}
