'use client';

import { motion } from 'framer-motion';
import { Map, Globe, CalendarDays, TrendingUp } from 'lucide-react';
import type { Trip } from '@/services/trip-service';

interface StatsBarProps {
    trips: Trip[];
}

function daysUntilNext(trips: Trip[]): number | null {
    const now = Date.now() / 1000;
    const upcoming = trips
        .filter(t => (t.startDateTimestamp || 0) > now)
        .sort((a, b) => (a.startDateTimestamp || 0) - (b.startDateTimestamp || 0));
    if (!upcoming[0]?.startDateTimestamp) return null;
    return Math.ceil((upcoming[0].startDateTimestamp - now) / 86400);
}

export function StatsBar({ trips }: StatsBarProps) {
    const now = Date.now() / 1000;
    const upcoming = trips.filter(t => (t.startDateTimestamp || 0) > now).length;
    const countries = new Set(trips.map(t => t.primaryDestinationCountry).filter(Boolean)).size;
    const nextTripDays = daysUntilNext(trips);

    const stats = [
        {
            icon: Map,
            value: trips.length,
            label: 'Total trips',
            accent: 'text-primary',
            bg: 'bg-primary/10',
        },
        {
            icon: CalendarDays,
            value: upcoming,
            label: 'Upcoming',
            accent: 'text-teal-400',
            bg: 'bg-teal-400/10',
        },
        {
            icon: Globe,
            value: countries,
            label: 'Countries',
            accent: 'text-violet-400',
            bg: 'bg-violet-400/10',
        },
        {
            icon: TrendingUp,
            value: nextTripDays !== null ? `${nextTripDays}d` : '—',
            label: 'Next trip',
            accent: 'text-orange-400',
            bg: 'bg-orange-400/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className="surface-interactive flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
                >
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                        <stat.icon className={`h-5 w-5 ${stat.accent}`} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <div className={`text-2xl font-bold ${stat.accent} leading-none tracking-tight`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground leading-tight truncate mt-1">{stat.label}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
