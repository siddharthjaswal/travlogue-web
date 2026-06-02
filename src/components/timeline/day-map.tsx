'use client';

/**
 * DayMap — per-day overview map at the top of each TimelineDay.
 *
 * IntersectionObserver defers each map until it's near the viewport so
 * all 8 Iceland roadtrip maps don't boot simultaneously and kill the tab.
 * The outer container always has the full 220px height so layout never
 * shifts when the map boots.
 */

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { Activity } from '@/services/activity-service';
import { type DayMarker } from '@/components/maps/day-map-inner';

// Dynamic import with ssr:false — Leaflet must not run on the server.
// No loading spinner needed; the outer placeholder div handles that.
const DayMapInner = dynamic(() => import('@/components/maps/day-map-inner'), { ssr: false });

const MAP_HEIGHT = 220;

interface DayMapProps {
    activities: Activity[];
}

export function DayMap({ activities }: DayMapProps) {
    const holderRef            = useRef<HTMLDivElement>(null);
    const [ready, setReady]    = useState(false);

    // Only boot when the placeholder scrolls within 400 px of the viewport
    useEffect(() => {
        const el = holderRef.current;
        if (!el) return;

        // Already visible on first paint (e.g., first day)
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 400) {
            setReady(true);
            return;
        }

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

    const markers: DayMarker[] = mappable.map((a, i) => ({
        lat:   Number(a.latitude),
        lng:   Number(a.longitude),
        type:  a.activityType ?? 'other',
        name:  a.name,
        time:  a.time ?? undefined,
        index: i,
    }));

    return (
        <div
            ref={holderRef}
            className="mb-5 rounded-xl overflow-hidden border border-border/20 shadow-sm bg-muted/10"
            style={{ height: MAP_HEIGHT }}
        >
            {ready && <DayMapInner markers={markers} height={MAP_HEIGHT} />}
        </div>
    );
}
