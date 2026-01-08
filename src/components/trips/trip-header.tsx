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
            onError: () => {
                toast.error("Failed to delete trip");
            }
        });
    };

    const formattedDate = (timestamp?: number) =>
        timestamp ? format(new Date(timestamp * 1000), 'MMM d, yyyy') : '';

    return (
        <div className="relative">
            {/* Cover Image Placeholder */}
            <div className="h-64 w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl relative overflow-hidden">
                {trip.coverPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={trip.coverPhotoUrl}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Info Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 px-6 relative z-10 gap-4">
                <div className="bg-background/95 backdrop-blur shadow-lg p-6 rounded-xl border border-border md:min-w-[400px]">
                    <h1 className="text-2xl font-bold mb-2">{trip.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        {(trip.primaryDestinationCity || trip.primaryDestinationCountry) && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
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

                <div className="flex gap-2">
                    <Button variant="secondary" className="shadow-lg">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="icon" className="shadow-lg">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
