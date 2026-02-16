'use client';

import { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import { TRAVEL_MAP_STYLE } from '@/lib/map-theme';

interface StyledMapProps {
  center: { lat: number; lng: number };
  marker?: { lat: number; lng: number } | null;
  markers?: { lat: number; lng: number }[];
  height?: number;
  onClick?: (lat: number, lng: number) => void;
  rounded?: string;
  className?: string;
}

export function StyledMap({ center, marker, markers, height = 220, onClick, rounded = 'rounded-xl', className }: StyledMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
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

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    // Clear existing multi markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!markers || markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.forEach((m) => {
      const marker = new google.maps.Marker({ position: m, map: mapInstanceRef.current });
      markersRef.current.push(marker);
      bounds.extend(m);
    });

    if (markers.length === 1) {
      mapInstanceRef.current.setCenter(markers[0]);
      mapInstanceRef.current.setZoom(15);
    } else {
      mapInstanceRef.current.fitBounds(bounds, 80);
    }
  }, [markers?.length, JSON.stringify(markers)]);

  return (
    <div
      ref={mapRef}
      className={`${rounded} overflow-hidden border border-border/30 ${className || ''}`}
      style={height ? { height } : { height: '100%', width: '100%' }}
    />
  );
}
