'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { showError } from '@/lib/toast-helper';
import { useTripTimeline, useCreateTripDay, useTrip } from '@/hooks/use-trips';
import { useAccommodationsByTrip } from '@/hooks/use-accommodations';
import { Accommodation } from '@/services/accommodation-service';
import { TimelineDay } from './timeline-day';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Maximize2 } from 'lucide-react';
import { AddActivityDialog } from './add-activity-dialog';
import { toast } from 'sonner';
import { TripMap } from '@/components/trips/trip-map';

interface TimelineViewProps {
    tripId: number;
    readOnly?: boolean;
}

export function TimelineView({ tripId, readOnly }: TimelineViewProps) {
    const { data: timeline, isLoading, isError } = useTripTimeline(tripId);
    const [mapOpen,    setMapOpen]    = useState(false);
    const [mapMounted, setMapMounted] = useState(false);
    const [activeDayId, setActiveDayId] = useState<number | null>(null);
    const dayRefs = useRef<Map<number, HTMLElement>>(new Map());

    // Delay mounting the full-screen map until overlay animation completes
    useEffect(() => {
        if (mapOpen) {
            const t = setTimeout(() => setMapMounted(true), 350);
            return () => clearTimeout(t);
        } else {
            setMapMounted(false);
        }
    }, [mapOpen]);

    const { data: trip }           = useTrip(tripId);
    const { data: accommodations } = useAccommodationsByTrip(tripId);
    const createTripDay            = useCreateTripDay();

    // Scroll-spy: track the last day whose top has crossed TARGET_LINE
    const dayIdsKey = (timeline?.days || []).map((d) => d.id).join(',');
    useEffect(() => {
        const dayIds = dayIdsKey ? dayIdsKey.split(',').map(Number) : [];
        if (dayIds.length === 0) return;

        const TARGET_LINE = 160;

        const findScrollParent = (node: HTMLElement | null): HTMLElement | Window => {
            let el = node?.parentElement;
            while (el) {
                const oy = getComputedStyle(el).overflowY;
                if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) return el;
                el = el.parentElement;
            }
            return window;
        };
        const scroller = findScrollParent(dayRefs.current.get(dayIds[0]) ?? null);

        const atBottom = () => {
            if (scroller instanceof Window)
                return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            return scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
        };

        let frame = 0;
        const compute = () => {
            frame = 0;
            let current = atBottom() ? dayIds[dayIds.length - 1] : dayIds[0];
            if (!atBottom()) {
                for (const id of dayIds) {
                    const el = dayRefs.current.get(id);
                    if (!el) continue;
                    if (el.getBoundingClientRect().top - TARGET_LINE <= 0) current = id;
                    else break;
                }
            }
            setActiveDayId((prev) => (prev === current ? prev : current));
        };
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(compute); };

        compute();
        scroller.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            scroller.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [dayIdsKey]);

    const handleAddDay = async () => {
        try {
            let date = new Date().toISOString().split('T')[0];
            if (trip?.startDateTimestamp)
                date = new Date(trip.startDateTimestamp * 1000).toISOString().split('T')[0];
            await createTripDay.mutateAsync({
                tripId,
                date,
                dayNumber: 1,
                place: trip?.primaryDestinationCity || trip?.primaryDestinationCountry || 'Unknown',
            });
            toast.success('Day added successfully');
        } catch (error) {
            showError('Failed to add day', error);
        }
    };

    if (isLoading) return <TimelineSkeleton />;
    if (isError)   return <div className="text-destructive">Failed to load timeline.</div>;

    if (!timeline || timeline.days.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold">Itinerary is empty</h3>
                <p className="text-muted-foreground mb-4">Start by adding days to your trip.</p>
                <Button onClick={handleAddDay} disabled={createTripDay.isPending}>
                    {createTripDay.isPending ? 'Adding…' : 'Add Day'}
                </Button>
            </div>
        );
    }

    // ── Stay map ─────────────────────────────────────────────────────────────
    const stayMap = new Map<number, {
        name: string; nights: number;
        isStart: boolean; isEnd: boolean;
        checkInTime?: number | null; checkOutTime?: number | null;
        accommodations?: Accommodation[];
    }>();

    const stayByDayName  = timeline.days.map((day) => {
        const acc = (accommodations ?? []).filter(a => a.tripDayId === day.id);
        return acc[0]?.name ?? null;
    });
    const stayTimesByDay = timeline.days.map((day) => {
        const acc     = (accommodations ?? []).filter(a => a.tripDayId === day.id);
        const checkIn = acc.find(a => a.accommodationType === 'check_in')?.checkInTime ?? null;
        const checkOut= acc.find(a => a.accommodationType === 'check_out')?.checkOutTime ?? null;
        return { checkIn, checkOut };
    });

    let i = 0;
    while (i < stayByDayName.length) {
        const name = stayByDayName[i];
        if (!name) { i++; continue; }
        let j = i + 1;
        while (j < stayByDayName.length && stayByDayName[j] === name) j++;
        const nights       = Math.max(1, j - i);
        const segmentIds   = timeline.days.slice(i, j).map(d => d.id);
        const segmentAcc   = (accommodations ?? []).filter(a => segmentIds.includes(a.tripDayId) && a.name === name);
        for (let k = i; k < j; k++) {
            stayMap.set(timeline.days[k].id, {
                name, nights,
                isStart: k === i, isEnd: k === j - 1,
                checkInTime:  stayTimesByDay[k]?.checkIn  ?? null,
                checkOutTime: stayTimesByDay[k]?.checkOut ?? null,
                accommodations: segmentAcc,
            });
        }
        i = j;
    }

    // ── Day strip scroll helper ───────────────────────────────────────────────
    const scrollToDay = (dayId: number) => {
        const el = dayRefs.current.get(dayId);
        if (!el) return;
        // Use same scroll-parent logic as spy
        const findScrollParent = (node: HTMLElement | null): HTMLElement | null => {
            let p = node?.parentElement;
            while (p) {
                const oy = getComputedStyle(p).overflowY;
                if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
                p = p.parentElement;
            }
            return null;
        };
        const sp = findScrollParent(el);
        if (sp) {
            const offset = el.offsetTop - sp.offsetTop - 100;
            sp.scrollTo({ top: offset, behavior: 'smooth' });
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="py-4 space-y-4">
            {/* ── Horizontal day strip ─────────────────────────────────────── */}
            <div className="sticky top-4 z-20">
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none rounded-2xl border border-border/20 bg-background/80 backdrop-blur-md px-2 py-2 shadow-sm">
                    {timeline.days.map((day) => {
                        const d       = new Date(day.date);
                        const isActive = day.id === activeDayId;
                        const hasPlan  = day.activities.length > 0;
                        return (
                            <button
                                key={day.id}
                                onClick={() => scrollToDay(day.id)}
                                className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                                }`}
                            >
                                <span className="font-bold text-sm leading-none">{format(d, 'd')}</span>
                                <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-70">{format(d, 'EEE')}</span>
                                {hasPlan && !isActive && (
                                    <span className="mt-0.5 h-1 w-1 rounded-full bg-primary/60" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Full-screen map overlay ──────────────────────────────────── */}
            {mapOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0d1117' }} className="flex flex-col">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-card/80 backdrop-blur flex-shrink-0">
                        <span className="text-sm font-semibold text-foreground">{trip?.name} — Map</span>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                                {[['#7FD1C8','Sightseeing'],['#F2A477','Dining'],['#A8A4F2','Transport'],['#8FB7FF','Stay']].map(([c,l]) => (
                                    <span key={l} className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                                        {l}
                                    </span>
                                ))}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground" onClick={() => setMapOpen(false)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </Button>
                        </div>
                    </div>
                    <div style={{ flex: 1 }} ref={(el) => { if (el && !mapMounted) setTimeout(() => setMapMounted(true), 50); }}>
                        {mapMounted && trip && (
                            <TripMap trip={trip} height={typeof window !== 'undefined' ? window.innerHeight - 52 : 700} className="w-full" />
                        )}
                    </div>
                </div>
            )}

            {/* ── Timeline stream ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-4 shadow-sm">
                {/* Expand-map button — top-right corner */}
                <div className="flex justify-end mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground border border-border/30 h-7 px-3 text-xs"
                        onClick={() => setMapOpen(true)}
                    >
                        <Maximize2 className="h-3 w-3" />
                        Full map
                    </Button>
                </div>

                {timeline.days.map((day) => (
                    <div
                        key={day.id}
                        data-day-id={day.id}
                        ref={(el) => {
                            if (el) dayRefs.current.set(day.id, el);
                            else    dayRefs.current.delete(day.id);
                        }}
                        className="relative pb-12 sm:pb-16 scroll-mt-28"
                    >
                        <TimelineDay day={day} stayInfo={stayMap.get(day.id)} readOnly={readOnly} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TimelineSkeleton() {
    return (
        <div className="space-y-8 py-6">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-9 w-24" />
            </div>
            {[1, 2].map((i) => (
                <div key={i} className="md:grid md:grid-cols-[200px_1fr] gap-8">
                    <div className="hidden md:block">
                        <Skeleton className="h-8 w-24 ml-auto mb-2" />
                        <Skeleton className="h-4 w-32 ml-auto" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
