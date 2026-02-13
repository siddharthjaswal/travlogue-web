'use client';

import { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import { TRAVEL_MAP_STYLE } from '@/lib/map-theme';

interface StyledMapProps {
  center: { lat: number; lng: number };
  marker?: { lat: number; lng: number } | null;
  height?: number;
  onClick?: (lat: number, lng: number) => void;
  rounded?: string;
}

export function StyledMap({ center, marker, height = 220, onClick, rounded = 'rounded-xl' }: StyledMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
  }, [marker?.lat, marker?.lng]);

  return (
    <div
      ref={mapRef}
      className={`${rounded} overflow-hidden border border-border/30`}
      style={{ height }}
    />
  );
}
