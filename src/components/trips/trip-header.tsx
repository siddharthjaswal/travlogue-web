'use client';

import { Trip } from '@/services/trip-service';
import { Button } from '@/components/ui/button';
import { Calendar, MoreVertical, Trash, Share2, Plane } from 'lucide-react';
import { useDeleteTrip } from '@/hooks/use-trips';
import { format, differenceInDays } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { showError } from '@/lib/toast-helper';
import { getDestinationImageUrl, isDeprecatedUnsplashUrl } from '@/lib/destination-images';

interface TripHeaderProps {
    trip: Trip;
    readOnly?: boolean;
}

const COUNTRY_FLAGS: Record<string, string> = {
    france: '🇫🇷', italy: '🇮🇹', spain: '🇪🇸', japan: '🇯🇵',
    greece: '🇬🇷', thailand: '🇹🇭', indonesia: '🇮🇩', uk: '🇬🇧',
    germany: '🇩🇪', usa: '🇺🇸', australia: '🇦🇺', uae: '🇦🇪',
    turkey: '🇹🇷', india: '🇮🇳', china: '🇨🇳', brazil: '🇧🇷',
    portugal: '🇵🇹', austria: '🇦🇹', netherlands: '🇳🇱',
};
function getFlag(country?: string | null) {
    return COUNTRY_FLAGS[(country || '').toLowerCase()] || '🌍';
}

export function TripHeader({ trip, readOnly }: TripHeaderProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [imageError, setImageError] = useState(false);
    const deleteTrip = useDeleteTrip();
    const router = useRouter();

    // Smart banner image
    const bannerUrl = useMemo(() => {
        const stored = trip.bannerPhotoUrl || trip.coverPhotoUrl;
        if (stored && !isDeprecatedUnsplashUrl(stored) && !imageError) return stored;
        return getDestinationImageUrl(trip.primaryDestinationCity, trip.primaryDestinationCountry);
    }, [trip.bannerPhotoUrl, trip.coverPhotoUrl, trip.primaryDestinationCity, trip.primaryDestinationCountry, imageError]);

    // Date info
    const startDate = trip.startDateTimestamp ? new Date(trip.startDateTimestamp * 1000) : null;
    const endDate = trip.endDateTimestamp ? new Date(trip.endDateTimestamp * 1000) : null;
    const tripDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : null;
    const daysUntil = startDate ? Math.ceil((startDate.getTime() - Date.now()) / 86400000) : null;
    const isUpcoming = daysUntil !== null && daysUntil > 0;
    const isNow = daysUntil !== null && daysUntil <= 0 && (endDate ? endDate.getTime() > Date.now() : false);

    const dateDisplay = startDate && endDate
        ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`
        : startDate ? format(startDate, 'MMM d, yyyy') : null;

    const handleDelete = () => {
        deleteTrip.mutate(trip.id, {
            onSuccess: () => {
                toast.success('Trip deleted');
                router.push('/dashboard/trips');
            },
            onError: (err: any) => showError('Failed to delete trip', err),
        });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/dashboard/trips/${trip.id}`);
            toast.success('Link copied!');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    return (
        <div className="relative animate-fade-in">
            {/* Hero banner */}
            <div className="h-64 sm:h-80 w-full rounded-3xl relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={bannerUrl}
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={() => setImageError(true)}
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                {/* Top-right: actions menu */}
                {!readOnly && (
                    <div className="absolute top-3 right-3 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-black/25 hover:bg-black/50 text-white border border-white/10">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={handleCopyLink}>
                                    <Share2 className="h-4 w-4 mr-2" />Share link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash className="h-4 w-4 mr-2" />Delete trip
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Bottom info card */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-lg px-5 py-4 space-y-2">
                        {/* Location */}
                        <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{getFlag(trip.primaryDestinationCountry)}</span>
                            <span className="text-white/55 text-xs font-medium uppercase tracking-widest">
                                {[trip.primaryDestinationCity, trip.primaryDestinationCountry].filter(Boolean).join(', ')}
                            </span>
                        </div>

                        {/* Trip name */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight">
                            {trip.name}
                        </h1>

                        {/* Date + duration + countdown — all inline */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                            {dateDisplay && (
                                <div className="flex items-center gap-1.5 text-white/65 text-xs">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{dateDisplay}</span>
                                </div>
                            )}
                            {tripDays && (
                                <>
                                    <span className="text-white/30 text-xs">·</span>
                                    <span className="text-xs text-white/65">{tripDays} days</span>
                                </>
                            )}
                            {isUpcoming && daysUntil !== null && (
                                <>
                                    <span className="text-white/30 text-xs">·</span>
                                    <span className="flex items-center gap-1 text-xs font-semibold text-primary-foreground bg-primary/75 px-2.5 py-0.5 rounded-full">
                                        <Plane className="h-3 w-3" />
                                        {daysUntil <= 30 ? `In ${daysUntil} days` : `In ${Math.round(daysUntil / 7)} weeks`}
                                    </span>
                                </>
                            )}
                            {isNow && (
                                <>
                                    <span className="text-white/30 text-xs">·</span>
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Happening now
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Permanently delete <span className="font-semibold">"{trip.name}"</span> and all its data. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
