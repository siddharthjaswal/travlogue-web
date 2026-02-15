import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, MoreVertical, Trash2, Edit, Sparkles, Loader2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Trip } from '@/services/trip-service';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
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
import { useDeleteTrip, useRegenerateCover } from '@/hooks/use-trips';
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
    const { mutate: regenerateCover, isPending: isRegenerating } = useRegenerateCover();

    // Auto-generate cover if missing
    useEffect(() => {
        if (!trip.coverPhotoUrl) {
            const timeout = setTimeout(() => {
                regenerateCover({ id: trip.id });
            }, index * 500 + 500);
            return () => clearTimeout(timeout);
        }
    }, [trip.coverPhotoUrl, trip.id, regenerateCover, index]);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        deleteTrip(trip.id, {
            onSuccess: () => {
                toast.success('Trip deleted successfully');
                setShowDeleteDialog(false);
            },
            onError: (error: any) => showError('Failed to delete trip', error)
        });
    };

    const handleRegenerateCover = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        regenerateCover({ id: trip.id }, {
            onSuccess: () => toast.success('New cover image generated! ✨'),
            onError: () => toast.error('Failed to generate cover')
        });
    };

    // Format dates
    const dateDisplay = trip.startDateTimestamp && trip.endDateTimestamp
        ? `${format(new Date(trip.startDateTimestamp * 1000), 'MMM d')} - ${format(new Date(trip.endDateTimestamp * 1000), 'MMM d, yyyy')}`
        : 'Dates TBD';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="h-full"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <div className="relative group h-full">
                    <Link href={`/dashboard/trips/${trip.id}`} className="block h-full">
                        <Card className={cn(
                            "relative overflow-hidden h-[320px] sm:h-[400px] flex flex-col",
                            "border-0 rounded-3xl shadow-lg",
                            "transition-all duration-500 ease-out",
                            "hover:shadow-2xl hover:scale-[1.02]",
                            "bg-muted"
                        )}>
                            {/* Full Background Image */}
                            <div className="absolute inset-0 z-0">
                                {trip.coverPhotoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={trip.coverPhotoUrl}
                                        alt={trip.name}
                                        className={cn(
                                            "w-full h-full object-cover",
                                            "transition-transform duration-700 ease-out",
                                            isHovered && "scale-110",
                                            isRegenerating && "opacity-50 blur-sm scale-110"
                                        )}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                        <MapPin className="h-16 w-16 text-slate-700" strokeWidth={1} />
                                    </div>
                                )}
                                
                                {/* Cinematic Gradient Overlays */}
                                {/* Top Shadow for badges */}
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                                {/* Bottom Blur + Gradient for text */}
                                <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/80 via-black/45 to-transparent backdrop-blur-xl pointer-events-none" />
                            </div>

                            {/* Top Controls (Glassmorphism) */}
                            <div className="relative z-10 flex justify-between items-start p-4">
                                {/* Actions Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48">
                                        <DropdownMenuItem onClick={handleRegenerateCover}>
                                            <Sparkles className="mr-2 h-4 w-4" /> Regenerate Cover
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('Edit coming soon!'); }}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Trip
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Status Badge */}
                                <Badge className={cn(
                                    "px-3 py-1 text-xs font-medium uppercase tracking-wider",
                                    "bg-white/20 text-white backdrop-blur-md border-white/10",
                                    "shadow-sm"
                                )}>
                                    {trip.status}
                                </Badge>
                            </div>

                            {/* Center Action (Generate Button if missing) */}
                            {!trip.coverPhotoUrl && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    <Button 
                                        variant="secondary"
                                        size="lg"
                                        className="bg-white/90 text-black hover:bg-white shadow-xl gap-2"
                                        onClick={handleRegenerateCover}
                                        disabled={isRegenerating}
                                    >
                                        {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        Generate Cover
                                    </Button>
                                </div>
                            )}

                            {/* Bottom Content */}
                            <div className="relative z-10 mt-auto p-6 space-y-3">
                                {/* Date */}
                                <div className="flex items-center gap-2 text-primary/90 text-xs font-semibold uppercase tracking-wider">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{dateDisplay}</span>
                                </div>

                                {/* Title & Location */}
                                <div>
                                    <h3 className="text-2xl font-bold text-white leading-tight mb-1 drop-shadow-sm">
                                        {trip.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>
                                            {trip.primaryDestinationCity || trip.primaryDestinationCountry || 'Destination Unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                {trip.description && (
                                    <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
                                        {trip.description}
                                    </p>
                                )}
                            </div>
                        </Card>
                    </Link>
                </div>
            </motion.div>

            {/* Delete Dialog */}
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
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
