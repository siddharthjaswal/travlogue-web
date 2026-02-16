'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCreateActivity, useUpdateActivity, useTrip, useTripTimeline } from '@/hooks/use-trips';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { Activity } from '@/services/activity-service';
import { showError } from '@/lib/toast-helper';
import { StyledMap } from '@/components/maps/styled-map';
import { guessCenter, parseLatLng, parseGoogleMapsLink } from '@/lib/geo';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    activityType: z.string().min(1, 'Please select an activity type'),
    date: z.date(),
    time: z.string().optional(),
    location: z.string().optional(),
    cost: z.string().refine((val) => !val || !isNaN(Number(val)), {
        message: 'Must be a valid number',
    }).optional(),
    notes: z.string().optional(),
});

interface AddActivityDialogProps {
    tripId: number;
    initialDate?: Date;
    initialTime?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
    activity?: Activity;
}

export function AddActivityDialog({
    tripId,
    initialDate,
    initialTime,
    trigger,
    open,
    onOpenChange,
    mode = 'create',
    activity
}: AddActivityDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const { data: trip } = useTrip(tripId);
    const { data: timeline } = useTripTimeline(tripId);
    const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
    const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();

    const isPending = isCreating || isUpdating;

    // Internal state management if not controlled externally
    const show = open !== undefined ? open : isOpen;
    const setShow = onOpenChange || setIsOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            activityType: 'sightseeing',
            date: initialDate || new Date(),
            time: initialTime || '',
            location: '',
            cost: '',
            notes: '',
        },
    });

    const lastActivityCoords = useMemo(() => {
        if (!timeline?.days) return null;
        for (const day of [...timeline.days].reverse()) {
            for (const act of [...day.activities].reverse()) {
                const coords = parseLatLng(act.location);
                if (coords) return coords;
            }
        }
        return null;
    }, [timeline]);

    const mapCenter = useMemo(() => {
        // Priority: activity location -> last activity coords -> trip city/country
        const actCoords = parseLatLng(activity?.location);
        if (actCoords) return actCoords;
        if (lastActivityCoords) return lastActivityCoords;
        return guessCenter(trip?.primaryDestinationCity, trip?.primaryDestinationCountry);
    }, [activity?.location, lastActivityCoords, trip?.primaryDestinationCity, trip?.primaryDestinationCountry]);

    const marker = useMemo(() => parseLatLng(form.getValues('location')) || null, [form]);

    const onMapClick = (lat: number, lng: number) => {
        form.setValue('location', `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    };

    // Reset/Populate form when dialog opens or mode/activity changes
    useEffect(() => {
        if (show) {
            if (mode === 'edit' && activity) {
                form.reset({
                    name: activity.name,
                    activityType: activity.activityType.toLowerCase(),
                    date: initialDate || new Date(),
                    time: activity.time || '',
                    location: activity.location || '',
                    cost: activity.cost ? String(activity.cost) : '',
                    notes: activity.notes || '',
                });
            } else {
                form.reset({
                    name: '',
                    activityType: 'sightseeing',
                    date: initialDate || new Date(),
                    time: initialTime || '',
                    location: '',
                    cost: '',
                    notes: '',
                });
            }
        }
    }, [show, mode, activity, initialDate, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (mode === 'edit' && activity) {
            updateActivity({
                id: activity.id,
                tripId,
                data: {
                    name: values.name,
                    activityType: values.activityType,
                    time: values.time || undefined,
                    location: values.location,
                    cost: values.cost ? Number(values.cost) : undefined,
                    notes: values.notes,
                }
            }, {
                onSuccess: () => {
                    toast.success('Activity updated');
                    setShow(false);
                },

                onError: (error: any) => {
                    showError('Failed to update activity', error);
                }
            });
        } else {
            createActivity({
                tripId,
                activityDate: format(values.date, 'yyyy-MM-dd'),
                name: values.name,
                activityType: values.activityType.toLowerCase(),
                time: values.time || undefined,
                location: values.location,
                cost: values.cost ? Number(values.cost) : undefined,
                notes: values.notes,
            }, {
                onSuccess: () => {
                    toast.success('Activity added successfully');
                    setShow(false);
                    if (mode === 'create') form.reset();
                },
                onError: (error: any) => {
                    showError('Failed to add activity', error);
                }
            });
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[900px] w-[95vw] overflow-y-auto max-h-[92vh]">
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'edit' ? 'Update the details of your activity.' : 'Add a new activity to your itinerary.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Louvre Museum Visit" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="activityType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="sightseeing">Sightseeing</SelectItem>
                                                <SelectItem value="dining">Dining</SelectItem>
                                                <SelectItem value="transportation">Transportation</SelectItem>
                                                <SelectItem value="cultural">Cultural</SelectItem>
                                                <SelectItem value="shopping">Shopping</SelectItem>
                                                <SelectItem value="adventure">Adventure</SelectItem>
                                                <SelectItem value="other">Stay / Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={mode === 'edit'}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            {mode !== 'edit' && (
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            )}
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Address, coordinates, or Google Maps link"
                                            {...field}
                                            onBlur={(e) => {
                                                field.onBlur();
                                                const value = e.target.value;
                                                if (value?.includes('google.com/maps')) {
                                                    const parsed = parseGoogleMapsLink(value);
                                                    if (parsed) {
                                                        if (parsed.lat && parsed.lng) {
                                                            form.setValue('location', `${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`);
                                                        }
                                                        if (parsed.name && !form.getValues('name')) {
                                                            form.setValue('name', parsed.name);
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-medium">Map</p>
                                    <p className="text-xs text-muted-foreground">Paste a Google Maps link or click to set coordinates</p>
                                </div>
                                <Button
                                    type="button"
                                    variant={showMap ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowMap(!showMap)}
                                >
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </Button>
                            </div>

                            {showMap && (
                                <StyledMap
                                    center={mapCenter}
                                    marker={marker}
                                    height={260}
                                    onClick={onMapClick}
                                    rounded="rounded-2xl"
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any extra details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === 'edit' ? 'Save Changes' : 'Add Activity'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
