'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import {
    Calendar, MoreVertical, Trash2,
    Loader2, Plane, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Trip } from '@/services/trip-service';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteTrip } from '@/hooks/use-trips';
import { toast } from 'sonner';
import { showError } from '@/lib/toast-helper';
import { getDestinationImageUrl, isDeprecatedUnsplashUrl } from '@/lib/destination-images';
import { getWeatherLabel } from '@/lib/weather';
import { guessCenter } from '@/lib/geo';

// Country → flag emoji
function getFlag(country?: string | null): string {
    const flags: Record<string, string> = {
        france: '🇫🇷', italy: '🇮🇹', spain: '🇪🇸', japan: '🇯🇵',
        greece: '🇬🇷', thailand: '🇹🇭', indonesia: '🇮🇩', uk: '🇬🇧',
        germany: '🇩🇪', usa: '🇺🇸', australia: '🇦🇺', uae: '🇦🇪',
        turkey: '🇹🇷', india: '🇮🇳', china: '🇨🇳', brazil: '🇧🇷',
        portugal: '🇵🇹', austria: '🇦🇹', netherlands: '🇳🇱',
        switzerland: '🇨🇭', sweden: '🇸🇪', norway: '🇳🇴',
        denmark: '🇩🇰', ireland: '🇮🇪', czechia: '🇨🇿',
        'czech republic': '🇨🇿', hungary: '🇭🇺', poland: '🇵🇱',
        croatia: '🇭🇷', singapore: '🇸🇬', southkorea: '🇰🇷',
        'south korea': '🇰🇷', mexico: '🇲🇽', canada: '🇨🇦',
    };
    return flags[(country || '').toLowerCase()] || '🌍';
}

interface TripCardProps {
    trip: Trip;
    index?: number;
}

export function TripCard({ trip, index = 0 }: TripCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { mutate: deleteTrip, isPending: isDeleting } = useDeleteTrip();

    // Live weather
    const [weatherBadge, setWeatherBadge] = useState<{ emoji: string; temp: number } | null>(null);
    useEffect(() => {
        const coords = guessCenter(trip.primaryDestinationCity ?? undefined, trip.primaryDestinationCountry ?? undefined);
        if (!coords) return;
        fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}&days=1`)
            .then(r => r.json())
            .then(d => {
                if (d.current) {
                    const info = getWeatherLabel(d.current.weatherCode, d.current.isDay);
                    setWeatherBadge({ emoji: info.emoji, temp: d.current.temperature });
                }
            })
            .catch(() => {});
    }, [trip.primaryDestinationCity, trip.primaryDestinationCountry]);

    // Smart image: use curated if cover is missing/deprecated
    const imageUrl = useMemo(() => {
        if (trip.coverPhotoUrl && !isDeprecatedUnsplashUrl(trip.coverPhotoUrl) && !imageError) {
            return trip.coverPhotoUrl;
        }
        return getDestinationImageUrl(trip.primaryDestinationCity, trip.primaryDestinationCountry, index);
    }, [trip.coverPhotoUrl, trip.primaryDestinationCity, trip.primaryDestinationCountry, index, imageError]);

    // Date calculations
    const startDate = trip.startDateTimestamp ? new Date(trip.startDateTimestamp * 1000) : null;
    const endDate = trip.endDateTimestamp ? new Date(trip.endDateTimestamp * 1000) : null;
    const tripDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : null;
    const daysUntil = startDate ? Math.ceil((startDate.getTime() - Date.now()) / 86400000) : null;
    const isPast = daysUntil !== null && daysUntil < 0;
    const isNow = daysUntil !== null && daysUntil <= 0 && !isPast;
    const isUpcoming = daysUntil !== null && daysUntil > 0;

    const dateDisplay = startDate && endDate
        ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`
        : startDate ? format(startDate, 'MMM d, yyyy') : 'Dates TBD';

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        deleteTrip(trip.id, {
            onSuccess: () => { toast.success('Trip deleted'); setShowDeleteDialog(false); },
            onError: (err: any) => showError('Failed to delete', err),
        });
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.5 }}
            >
                <Link href={`/dashboard/trips/${trip.id}`} className="block group">
                    <Card className="relative overflow-hidden rounded-3xl border-0 bg-muted h-[380px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">

                        {/* Background image */}
                        <div className="absolute inset-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt={trip.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                onError={() => setImageError(true)}
                            />
                            {/* Gradient overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-32" />
                        </div>

                        {/* Top row: menu + weather + status */}
                        <div className="relative z-10 flex items-center justify-between p-2">
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost" size="icon"
                                            className="h-8 w-8 rounded-xl bg-black/25 hover:bg-black/50 text-white border border-white/10"
                                            onClick={e => e.preventDefault()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={e => { e.preventDefault(); setShowDeleteDialog(true); }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />Delete Trip
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Live weather */}
                                {weatherBadge && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/30 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                                        {weatherBadge.emoji} {weatherBadge.temp}°C
                                    </span>
                                )}
                            </div>

                            {/* Days until countdown */}
                            <div className="flex items-center gap-2">
                                {isUpcoming && daysUntil! <= 30 && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary text-white text-xs font-bold">
                                        <Plane className="h-3 w-3" />
                                        In {daysUntil}d
                                    </span>
                                )}
                                {isUpcoming && daysUntil! > 30 && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/30 border border-white/15 text-white/80 text-xs backdrop-blur-sm">
                                        <Clock className="h-3 w-3" />
                                        {Math.round(daysUntil! / 7)}w away
                                    </span>
                                )}
                                {isPast && (
                                    <span className="px-2.5 py-1 rounded-xl bg-white/15 border border-white/20 text-white/70 text-xs">
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bottom content */}
                        <div className="relative z-10 mt-auto p-2">
                            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 space-y-2.5">
                                {/* Location + flag */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xl leading-none">{getFlag(trip.primaryDestinationCountry)}</span>
                                    <span className="text-white/70 text-xs font-medium uppercase tracking-widest">
                                        {[trip.primaryDestinationCity, trip.primaryDestinationCountry].filter(Boolean).join(', ')}
                                    </span>
                                </div>

                                {/* Trip name */}
                                <h3 className="text-xl font-bold text-white leading-tight tracking-tight">
                                    {trip.name}
                                </h3>

                                {/* Description */}
                                {trip.description && (
                                    <p className="text-white/55 text-xs leading-relaxed line-clamp-2">
                                        {trip.description}
                                    </p>
                                )}

                                {/* Date + duration strip */}
                                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{dateDisplay}</span>
                                    </div>
                                    {tripDays && (
                                        <span className="text-xs font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                                            {tripDays}d
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Link>
            </motion.div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Permanently delete <span className="font-semibold">"{trip.name}"</span>? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 rounded-xl"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Trip
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
