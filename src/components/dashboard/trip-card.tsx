import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, MoreVertical, Trash2, Edit, Heart } from 'lucide-react';
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
    const [isHovered, setIsHovered] = useState(false);
    const { mutate: deleteTrip, isPending: isDeleting } = useDeleteTrip();

    const handleDelete = (e: React.MouseEvent) => {
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

    // Format dates elegantly
    const dateDisplay = trip.startDateTimestamp && trip.endDateTimestamp
        ? `${format(new Date(trip.startDateTimestamp * 1000), 'MMM d')} - ${format(new Date(trip.endDateTimestamp * 1000), 'MMM d, yyyy')}`
        : 'Dates to be decided';

    // Sophisticated status styling
    const statusStyles = {
        planning: 'bg-primary/10 text-primary border-primary/20',
        active: 'bg-accent/10 text-accent-foreground border-accent/20',
        completed: 'bg-muted text-muted-foreground border-border',
        cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="h-full"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <div className="relative group h-full">
                    <Link href={`/dashboard/trips/${trip.id}`} className="block h-full">
                        <Card className={cn(
                            "overflow-hidden h-full flex flex-col relative",
                            "border-border/40 rounded-2xl",
                            "transition-all duration-300 ease-out",
                            "hover:border-primary/30 hover:shadow-xl",
                            "focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2"
                        )}>
                            {/* Sophisticated Cover Image */}
                            <div className={cn(
                                "h-48 w-full relative overflow-hidden",
                                !trip.coverPhotoUrl && "bg-gradient-to-br from-primary/8 via-secondary/5 to-accent/5"
                            )}>
                                {trip.coverPhotoUrl ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={trip.coverPhotoUrl}
                                            alt={trip.name}
                                            className={cn(
                                                "w-full h-full object-cover",
                                                "transition-transform duration-700 ease-out",
                                                isHovered && "scale-105"
                                            )}
                                        />
                                        {/* Warm gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <MapPin className="h-16 w-16 text-primary/20" strokeWidth={1.5} />
                                    </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className="absolute top-3 right-3 z-10">
                                    <Badge className={cn(
                                        "capitalize shadow-sm backdrop-blur-sm border",
                                        "transition-transform duration-200",
                                        isHovered && "scale-105",
                                        statusStyles[trip.status as keyof typeof statusStyles]
                                    )}>
                                        {trip.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex flex-col flex-1 p-5">
                                <CardHeader className="p-0 pb-3 space-y-2">
                                    <h3 className={cn(
                                        "font-bold text-xl leading-tight tracking-tight",
                                        "transition-colors duration-200",
                                        isHovered && "text-primary"
                                    )}>
                                        {trip.name}
                                    </h3>
                                    
                                    <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">
                                            {trip.primaryDestinationCity && `${trip.primaryDestinationCity}, `}
                                            {trip.primaryDestinationCountry || 'Destination awaits'}
                                        </span>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {trip.description || 'An adventure waiting to be written...'}
                                    </p>
                                </CardContent>

                                <CardFooter className="p-0 pt-4 border-t border-border/30 mt-4">
                                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{dateDisplay}</span>
                                        </div>
                                        {trip.visibility === 'public' && (
                                            <div className="flex items-center gap-1" title="Public Trip">
                                                <Users className="h-3.5 w-3.5" />
                                            </div>
                                        )}
                                    </div>
                                </CardFooter>
                            </div>
                        </Card>
                    </Link>

                    {/* Floating Actions Menu */}
                    <div className={cn(
                        "absolute top-3 left-3 z-10",
                        "transition-opacity duration-200",
                        "opacity-0 group-hover:opacity-100"
                    )}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className={cn(
                                        "h-9 w-9 rounded-xl",
                                        "bg-background/90 backdrop-blur-md",
                                        "shadow-lg border border-border/40",
                                        "hover:bg-background hover:scale-105",
                                        "transition-all duration-200"
                                    )}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40">
                                <DropdownMenuItem 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        toast.info('Edit feature coming soon!'); 
                                    }}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> 
                                    Edit Trip
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteDialog(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> 
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </motion.div>

            {/* Elegant Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">Delete this trip?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base leading-relaxed">
                            This will permanently delete <span className="font-semibold text-foreground">"{trip.name}"</span> and all associated memories. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Keep Trip</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 focus:ring-destructive rounded-xl"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Forever'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
