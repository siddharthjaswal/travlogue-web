'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import { TRAVEL_MAP_STYLE } from '@/lib/map-theme';

interface StyledMapProps {
  center: { lat: number; lng: number };
  marker?: { lat: number; lng: number } | null;
  markers?: { lat: number; lng: number; kind?: 'activity' | 'stay'; type?: string; title?: string; subtitle?: string }[];
  height?: number;
  onClick?: (lat: number, lng: number) => void;
  rounded?: string;
  className?: string;
}

export function StyledMap({ center, marker, markers, height = 220, onClick, rounded = 'rounded-xl', className }: StyledMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const markerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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

    const stroke = '#3E4A5A';
    const ring = '#D7DEE8';
    const fill = '#F4F6FA';

    const iconPaths = (() => {
      if (isStay || t.includes('other')) {
        return `
          <rect x="10" y="7" width="16" height="20" rx="2" />
          <path d="M10 22v-6.57" />
          <path d="M14 15.43V22" />
          <path d="M15 16a5 5 0 0 0-6 0" />
          <path d="M12 11h.01" />
          <path d="M12 7h.01" />
          <path d="M16 11h.01" />
          <path d="M16 7h.01" />
          <path d="M8 11h.01" />
          <path d="M8 7h.01" />
        `;
      }
      if (t.includes('sightseeing')) {
        return `
          <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
          <circle cx="12" cy="13" r="3" />
        `;
      }
      if (t.includes('dining')) {
        return `
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        `;
      }
      if (t.includes('transport')) {
        return `
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        `;
      }
      return `
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      `;
    })();

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10.5" fill="${fill}" stroke="${ring}" />
        <g transform="translate(0,0)">
          ${iconPaths}
        </g>
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

    if (!markers || markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    markers.forEach((m) => {
      const iconUrl = getMarkerSvg(m.kind, m.type);
      const marker = new google.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map: mapInstanceRef.current,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15),
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

    if (markers.length === 1) {
      mapInstanceRef.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      mapInstanceRef.current.setZoom(15);
    } else {
      mapInstanceRef.current.fitBounds(bounds, 80);
    }
  }, [markers?.length, JSON.stringify(markers), mapReady]);

  return (
    <div
      ref={mapRef}
      className={`${rounded} overflow-hidden border border-border/30 ${className || ''}`}
      style={height ? { height } : { height: '100%', width: '100%' }}
    />
  );
}
