'use client';

import { Trip } from '@/services/trip-service';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, MoreVertical, Edit, Trash, Share2 } from 'lucide-react';
import { collectDayPlaces } from '@/lib/places';
import { useTripTimeline, useRegenerateBanner } from '@/hooks/use-trips';
import { useAccommodationsByTrip } from '@/hooks/use-accommodations';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTrip } from '@/hooks/use-trips';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { showError } from '@/lib/toast-helper';

interface TripHeaderProps {
    trip: Trip;
    readOnly?: boolean;
}

export function TripHeader({ trip, readOnly }: TripHeaderProps) {
    const { data: timeline } = useTripTimeline(trip.id);
    const { data: accommodations } = useAccommodationsByTrip(trip.id);
    const { mutate: regenerateBanner } = useRegenerateBanner();
    const derivedPlaces = collectDayPlaces({
        dayPlace: undefined,
        activityLocations: (timeline?.days || []).flatMap((d) => d.activities.map((a) => a.location)),
        transitLocations: [],
        stayLocations: (accommodations || []).map((a) => a.address || a.name),
    });
    const bannerQuery = [
        trip.primaryDestinationCity,
        trip.primaryDestinationCountry,
        trip.name,
        'scenic',
        'wide',
        'landscape'
    ].filter(Boolean).join(' ');

    const placeText = derivedPlaces.length > 0
        ? derivedPlaces.slice(0, 3).join(', ') + (derivedPlaces.length > 3 ? ` +${derivedPlaces.length - 3}` : '')
        : [trip.primaryDestinationCity, trip.primaryDestinationCountry].filter(Boolean).join(', ');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const deleteTrip = useDeleteTrip();
    const router = useRouter();

    useEffect(() => {
        if (!trip.bannerPhotoUrl) {
            regenerateBanner({ id: trip.id, query: bannerQuery });
        }
    }, [trip.bannerPhotoUrl, trip.id, bannerQuery, regenerateBanner]);

    const handleDelete = () => {
        deleteTrip.mutate(trip.id, {
            onSuccess: () => {
                toast.success("Trip deleted successfully");
                router.push('/dashboard/trips');
            },
            onError: (error: any) => {
                showError("Failed to delete trip", error);
            }
        });
    };

    const formattedDate = (timestamp?: number) =>
        timestamp ? format(new Date(timestamp * 1000), 'MMM d, yyyy') : '';

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/dashboard/trips/${trip.id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleExportPdf = () => {
        toast.info('Preparing print view...');
        window.print();
    };

    return (
        <div className="relative animate-fade-in">
            {/* Elegant Cover Image */}
            <div className="h-56 sm:h-72 w-full bg-gradient-to-br from-primary/20 via-accent/15 to-secondary/10 rounded-3xl relative overflow-hidden group">
                {(trip.bannerPhotoUrl || trip.coverPhotoUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={trip.bannerPhotoUrl || trip.coverPhotoUrl}
                        alt={trip.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                )}
                {/* Sophisticated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                {/* Top actions */}
                {!readOnly && (
                    <div className="absolute top-3 right-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-[14px] bg-black/20 hover:bg-black/40 text-white border border-white/10">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleCopyLink()}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportPdf()}>
                                    Export as PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Trip
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDeleteDialog(true)}>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete Trip
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Glass info card inside image */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                    <div className="rounded-[16px] border border-white/10 bg-black/35 backdrop-blur-md px-4 py-3 text-white">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">{trip.name}</h1>
                        <div className="flex flex-col gap-2 text-white/80 text-sm">
                            {(trip.primaryDestinationCity || trip.primaryDestinationCountry) && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-white/70 flex-shrink-0" />
                                    <span>
                                        {placeText || [trip.primaryDestinationCity, trip.primaryDestinationCountry].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                            {(trip.startDateTimestamp || trip.endDateTimestamp) && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-white/70" />
                                    <span>
                                        {formattedDate(trip.startDateTimestamp)}
                                        {trip.endDateTimestamp ? ` - ${formattedDate(trip.endDateTimestamp)}` : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full border border-white/15 bg-white/10">Status: {trip.status}</span>
                            <span className="px-2 py-1 rounded-full border border-white/15 bg-white/10">Visibility: {trip.visibility}</span>
                            {(trip.startDateTimestamp && trip.endDateTimestamp) && (
                                <span className="px-2 py-1 rounded-full border border-white/15 bg-white/10">
                                    {Math.ceil((trip.endDateTimestamp - trip.startDateTimestamp) / (60 * 60 * 24))} days
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the trip "{trip.name}" and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
