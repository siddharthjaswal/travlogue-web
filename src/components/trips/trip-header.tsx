'use client';

import { Trip } from '@/services/trip-service';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, MoreVertical, Edit, Trash, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
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
}

export function TripHeader({ trip }: TripHeaderProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const deleteTrip = useDeleteTrip();
    const router = useRouter();

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
            <div className="h-56 sm:h-72 w-full bg-gradient-to-br from-primary/20 via-accent/15 to-secondary/10 rounded-2xl relative overflow-hidden group">
                {trip.coverPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={trip.coverPhotoUrl}
                        alt={trip.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                )}
                {/* Sophisticated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            </div>

            {/* Info Card - Floating over cover */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 px-4 sm:px-6 relative z-10 gap-4">
                <div className="glass elevated-lg p-6 rounded-2xl border border-border/40 w-full md:min-w-[420px] transition-all">
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">{trip.name}</h1>
                    <div className="flex flex-col gap-2 text-muted-foreground text-sm">
                        {(trip.primaryDestinationCity || trip.primaryDestinationCountry) && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>
                                    {[trip.primaryDestinationCity, trip.primaryDestinationCountry].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                        {(trip.startDateTimestamp || trip.endDateTimestamp) && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {formattedDate(trip.startDateTimestamp)}
                                    {trip.endDateTimestamp ? ` - ${formattedDate(trip.endDateTimestamp)}` : ''}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="icon" className="shadow-lg w-full sm:w-10">
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
