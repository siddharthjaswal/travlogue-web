import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Trip } from '@/services/trip-service';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from 'sonner';
import { showError } from '@/lib/toast-helper';

interface TripCardProps {
    trip: Trip;
    index?: number;
}

export function TripCard({ trip, index = 0 }: TripCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { mutate: deleteTrip, isPending: isDeleting } = useDeleteTrip();

    const handleDelete = (e: React.MouseEvent) => {
        // Prevent clicking the card link
        e.preventDefault();
        e.stopPropagation();

        deleteTrip(trip.id, {
            onSuccess: () => {
                toast.success('Trip deleted successfully');
                setShowDeleteDialog(false);
            },
            onError: (error: any) => {
                showError('Failed to delete trip', error);
            }
        });
    };

    // Format dates or show "Flexible Dates"
    const dateDisplay = trip.startDateTimestamp && trip.endDateTimestamp
        ? `${format(new Date(trip.startDateTimestamp * 1000), 'MMM d')} - ${format(new Date(trip.endDateTimestamp * 1000), 'MMM d, yyyy')}`
        : 'Flexible Dates';

    // Status Color Mapping
    const statusColors = {
        planning: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
        active: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
        completed: 'bg-muted text-muted-foreground hover:bg-muted/80',
        cancelled: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
            >
                <div className="relative group h-full">
                    <Link href={`/dashboard/trips/${trip.id}`} className="block h-full">
                        <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col relative">
                            {/* Cover Image Area */}
                            <div className={cn(
                                "h-32 w-full relative bg-muted",
                                !trip.coverPhotoUrl && "bg-gradient-to-br from-primary/20 to-secondary/20"
                            )}>
                                {trip.coverPhotoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={trip.coverPhotoUrl}
                                        alt={trip.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                                        <MapPin className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge className={cn("capitalize shadow-sm", statusColors[trip.status as keyof typeof statusColors])}>
                                        {trip.status}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="pb-2">
                                <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors pr-6">
                                    {trip.name}
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    <span className="truncate">
                                        {trip.primaryDestinationCity ? `${trip.primaryDestinationCity}, ` : ''}
                                        {trip.primaryDestinationCountry || 'Unknown Destination'}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="pb-2 flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {trip.description || 'No description provided.'}
                                </p>
                            </CardContent>

                            <CardFooter className="pt-2 border-t border-border/30 bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
                                <div className="flex items-center">
                                    <Calendar className="mr-1.5 h-3 w-3" />
                                    {dateDisplay}
                                </div>
                                {trip.visibility === 'public' && (
                                    <div className="flex items-center" title="Public Trip">
                                        <Users className="h-3 w-3" />
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    </Link>

                    {/* Actions Menu - Absolute positioned to float above link */}
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('Edit feature coming soon!'); }}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-500 focus:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteDialog(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </motion.div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{trip.name}" and all associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Trip'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
