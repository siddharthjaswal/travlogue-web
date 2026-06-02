'use client';

/**
 * DayMap — per-day overview map at the top of each TimelineDay.
 *
 * Uses the shared StyledMap (Google Maps, dark theme) so markers, info
 * windows and route lines match the rest of the app. Lazy-initialised via
 * IntersectionObserver so all 8 Iceland roadtrip maps don't boot at once.
 */

import { useRef, useState, useEffect } from 'react';
import { Activity } from '@/services/activity-service';
import { StyledMap } from '@/components/maps/styled-map';

const MAP_HEIGHT = 220;

function formatTime(time?: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h)) return '';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

interface DayMapProps {
    activities: Activity[];
}

export function DayMap({ activities }: DayMapProps) {
    const holderRef         = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    // Boot when the placeholder scrolls within 400 px of the viewport
    useEffect(() => {
        const el = holderRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 400) { setReady(true); return; }

        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setReady(true); obs.disconnect(); } },
            { threshold: 0, rootMargin: '400px 0px' },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Only non-transport activities carry a primary lat/lng
    const sorted   = [...activities].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
    const mappable = sorted.filter(a => a.latitude != null && a.longitude != null);

    if (mappable.length === 0) return null;

    const markers = mappable.map(a => ({
        lat:      Number(a.latitude),
        lng:      Number(a.longitude),
        type:     a.activityType ?? 'other',
        title:    a.name,
        subtitle: formatTime(a.time ?? undefined),
        cost:     a.cost ?? undefined,
        currency: a.currency,
        notes:    a.notes ?? undefined,
    }));

    // Connect stops in time order
    const path = markers.map(m => ({ lat: m.lat, lng: m.lng }));
    const center = { lat: markers[0].lat, lng: markers[0].lng };

    return (
        <div
            ref={holderRef}
            className="mb-5 rounded-xl overflow-hidden"
            style={{ minHeight: MAP_HEIGHT }}
        >
            {ready ? (
                <StyledMap
                    center={center}
                    markers={markers}
                    path={path}
                    height={MAP_HEIGHT}
                    className="w-full"
                />
            ) : (
                <div style={{ height: MAP_HEIGHT }} className="rounded-xl bg-muted/10 border border-border/20" />
            )}
        </div>
    );
}
