'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays, differenceInMinutes } from 'date-fns';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
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
import { useCreateActivity, useUpdateActivity, useTrip, useTripTimeline, useDeleteActivity } from '@/hooks/use-trips';
import { useCreateAccommodation } from '@/hooks/use-accommodations';
import { toast } from 'sonner';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity } from '@/services/activity-service';
import { showError } from '@/lib/toast-helper';
import { StyledMap } from '@/components/maps/styled-map';
import { guessCenter, parseLatLng, parseGoogleMapsLink } from '@/lib/geo';
import api from '@/lib/api';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    activityType: z.string().min(1, 'Please select an activity type'),
    date: z.date(),
    time: z.string().optional(),
    location: z.string().optional(),
    startLocation: z.string().optional(),
    endLocation: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    transportMode: z.string().optional(),
    cost: z.string().refine((val) => !val || !isNaN(Number(val)), {
        message: 'Must be a valid number',
    }).optional(),
    notes: z.string().optional(),
    checkinDate: z.date().optional(),
    checkoutDate: z.date().optional(),
    checkinTime: z.string().optional(),
    checkoutTime: z.string().optional(),
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
    const createActivity = useCreateActivity();
    const createAccommodation = useCreateAccommodation();
    const updateActivity = useUpdateActivity();
    const deleteActivity = useDeleteActivity();

    const isPending = createActivity.isPending || updateActivity.isPending || createAccommodation.isPending || deleteActivity.isPending;

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
            startLocation: '',
            endLocation: '',
            startTime: '',
            endTime: '',
            transportMode: 'train',
            cost: '',
            notes: '',
            checkinDate: initialDate || new Date(),
            checkoutDate: addDays(initialDate || new Date(), 1),
            checkinTime: '',
            checkoutTime: '',
        },
    });

    const isStay = form.watch('activityType') === 'other';
    const isTransport = form.watch('activityType') === 'transportation';

    const startTimeValue = form.watch('startTime');
    const endTimeValue = form.watch('endTime');
    const transportDuration = useMemo(() => {
        if (!startTimeValue || !endTimeValue) return '';
        const [sh, sm] = startTimeValue.split(':').map(Number);
        const [eh, em] = endTimeValue.split(':').map(Number);
        if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return '';
        const start = new Date(0, 0, 0, sh, sm, 0);
        const end = new Date(0, 0, 0, eh, em, 0);
        const mins = differenceInMinutes(end, start);
        if (mins <= 0) return '';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h ? `${h}h ` : ''}${m ? `${m}m` : ''}`.trim();
    }, [startTimeValue, endTimeValue]);

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

    const locationValue = form.watch('location');
    const [isExpanding, setIsExpanding] = useState(false);
    const expandedCache = useRef(new Map<string, string>());
    const resolvedCache = useRef(new Map<string, any>());
    const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>(null);
    async function resolveLocationInput(value: string, setCoords: (c: {lat:number; lng:number} | null)=>void) {
        if (!value) return;
        if (resolvedCache.current.has(value)) {
            const cached = resolvedCache.current.get(value);
            if (cached?.lat && cached?.lng) setCoords({ lat: cached.lat, lng: cached.lng });
            return;
        }
        setIsExpanding(true);
        try {
            const res = await api.get('/utils/resolve-map-link', { params: { url: value } });
            resolvedCache.current.set(value, res?.data || {});
            if (res?.data?.lat && res?.data?.lng) setCoords({ lat: res.data.lat, lng: res.data.lng });
        } finally {
            setIsExpanding(false);
        }
    }

    const parsedLocation = useMemo(() => {
        const coords = parseLatLng(locationValue);
        if (coords) return coords;
        if (resolvedCoords) return resolvedCoords;
        const parsed = locationValue ? parseGoogleMapsLink(locationValue) : null;
        if (parsed?.lat && parsed?.lng) return { lat: parsed.lat, lng: parsed.lng };
        return null;
    }, [locationValue, resolvedCoords]);

    const transportCenter = useMemo(() => {
        if (startCoords) return startCoords;
        if (endCoords) return endCoords;
        return null;
    }, [startCoords, endCoords]);

    const mapCenter = useMemo(() => {
        // Priority: parsed location -> activity location -> last activity coords -> trip city/country
        if (transportCenter) return transportCenter;
        if (parsedLocation) return parsedLocation;
        const actCoords = parseLatLng(activity?.location);
        if (actCoords) return actCoords;
        if (lastActivityCoords) return lastActivityCoords;
        return guessCenter(trip?.primaryDestinationCity, trip?.primaryDestinationCountry);
    }, [parsedLocation, activity?.location, lastActivityCoords, trip?.primaryDestinationCity, trip?.primaryDestinationCountry]);

    const marker = parsedLocation || null;
    const transportMarkers = [
        startCoords ? { ...startCoords, kind: 'activity' as const, type: 'transportation' } : null,
        endCoords ? { ...endCoords, kind: 'activity' as const, type: 'transportation' } : null,
    ].filter(Boolean) as {lat:number; lng:number; kind: 'activity'; type?: string}[];
    const transportPath = startCoords && endCoords ? [startCoords, endCoords] : [];

    const onMapClick = (lat: number, lng: number) => {
        setResolvedCoords({ lat, lng });
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
                    startLocation: activity.location?.split('→')[0]?.trim()?.split('•')[0]?.trim() || activity.location || '',
                    endLocation: activity.location?.split('→')[1]?.trim()?.split('•')[0]?.trim() || '',
                    startTime: activity.time || '',
                    endTime: '',
                    transportMode: (activity.location || '').split('•')[1]?.trim().toLowerCase() || 'train',
                    cost: activity.cost ? String(activity.cost) : '',
                    notes: activity.notes || '',
                });
                setStartCoords(activity.startLatitude != null && activity.startLongitude != null ? { lat: Number(activity.startLatitude), lng: Number(activity.startLongitude) } : null);
                setEndCoords(activity.endLatitude != null && activity.endLongitude != null ? { lat: Number(activity.endLatitude), lng: Number(activity.endLongitude) } : null);
            } else {
                form.reset({
                    name: '',
                    activityType: 'sightseeing',
                    date: initialDate || new Date(),
                    time: initialTime || '',
                    location: '',
                    startLocation: '',
                    endLocation: '',
                    startTime: '',
                    endTime: '',
                    transportMode: 'train',
                    cost: '',
                    notes: '',
                    checkinDate: initialDate || new Date(),
                    checkoutDate: addDays(initialDate || new Date(), 1),
                    checkinTime: '',
                    checkoutTime: '',
                });
                setStartCoords(null);
                setEndCoords(null);
            }
        }
    }, [show, mode, activity, initialDate, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const isTransport = values.activityType === 'transportation';
        const cleanLocation = (val?: string) => (val ? val.split('•')[0].trim() : val);
        const routeBase = isTransport
            ? [cleanLocation(values.startLocation), cleanLocation(values.endLocation)].filter(Boolean).join(' → ')
            : values.location;
        const cleanedRouteBase = routeBase ? routeBase.split('•')[0].trim() : routeBase;
        const route = isTransport && values.transportMode
            ? `${cleanedRouteBase} • ${values.transportMode}`
            : cleanedRouteBase;
        const startTime = isTransport ? (values.startTime || values.time) : values.time;
        const notes = values.notes;

        if (mode === 'edit' && activity) {
            updateActivity.mutate({
                id: activity.id,
                tripId,
                data: {
                    name: values.name,
                    activityType: values.activityType,
                    time: startTime || undefined,
                    location: route,
                    latitude: (resolvedCoords || parsedLocation)?.lat ?? undefined,
                    longitude: (resolvedCoords || parsedLocation)?.lng ?? undefined,
                    startLatitude: isTransport ? (startCoords?.lat ?? null) : null,
                    startLongitude: isTransport ? (startCoords?.lng ?? null) : null,
                    endLatitude: isTransport ? (endCoords?.lat ?? null) : null,
                    endLongitude: isTransport ? (endCoords?.lng ?? null) : null,
                    cost: values.cost === '' ? null : values.cost ? Number(values.cost) : undefined,
                    notes: notes,
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
            return;
        }

        const isStay = values.activityType === 'other';
        if (isStay) {
            if (!values.checkinDate || !values.checkoutDate) {
                toast.error('Please select check-in and check-out dates');
                return;
            }

            const toUnix = (d?: Date, t?: string) => {
                if (!d || !t) return null;
                const [h, m] = t.split(':').map(Number);
                const dt = new Date(d);
                dt.setHours(h || 0, m || 0, 0, 0);
                return Math.floor(dt.getTime() / 1000);
            };

            const stayNotes = `Check-in: ${format(values.checkinDate, 'PPP')} ${values.checkinTime || ''} • Check-out: ${format(values.checkoutDate, 'PPP')} ${values.checkoutTime || ''}`.trim();
            const combinedNotes = [values.notes, stayNotes].filter(Boolean).join('\n');

            try {
                await createAccommodation.mutateAsync({
                    tripId,
                    checkInDate: format(values.checkinDate, 'yyyy-MM-dd'),
                    checkOutDate: format(values.checkoutDate, 'yyyy-MM-dd'),
                    checkInTime: toUnix(values.checkinDate, values.checkinTime),
                    checkOutTime: toUnix(values.checkoutDate, values.checkoutTime),
                    name: values.name,
                    address: values.location,
                    latitude: (resolvedCoords || parsedLocation)?.lat ?? undefined,
                    longitude: (resolvedCoords || parsedLocation)?.lng ?? undefined,
                    cost: values.cost === '' ? null : values.cost ? Number(values.cost) : undefined,
                    notes: combinedNotes,
                });

                toast.success('Stay added successfully');
                setShow(false);
                form.reset();
            } catch (error: any) {
                showError('Failed to add stay', error);
            }
            return;
        }

        createActivity.mutate({
            tripId,
            activityDate: format(values.date, 'yyyy-MM-dd'),
            name: values.name,
            activityType: values.activityType.toLowerCase(),
            time: startTime || undefined,
            location: route,
            latitude: (resolvedCoords || parsedLocation)?.lat ?? undefined,
            longitude: (resolvedCoords || parsedLocation)?.lng ?? undefined,
            startLatitude: isTransport ? (startCoords?.lat ?? null) : undefined,
            startLongitude: isTransport ? (startCoords?.lng ?? null) : undefined,
            endLatitude: isTransport ? (endCoords?.lat ?? null) : undefined,
            endLongitude: isTransport ? (endCoords?.lng ?? null) : undefined,
            cost: values.cost === '' ? null : values.cost ? Number(values.cost) : undefined,
            notes: notes,
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

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[900px] w-[95vw] overflow-y-auto max-h-[92vh]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">{mode === 'edit' ? 'Edit Activity' : 'Add Activity'}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {mode === 'edit' ? 'Update the details of your activity.' : 'Add a new activity to your itinerary.'}
                                </p>
                            </div>
                            {!isStay && (
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col md:mr-8">
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
                            )}
                        </div>
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

                        <div className={cn("grid gap-4", isStay ? "grid-cols-1" : "grid-cols-2")}>
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

                            {isTransport ? (
                                <FormField
                                    control={form.control}
                                    name="transportMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mode</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select mode" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="flight">Flight</SelectItem>
                                                    <SelectItem value="train">Train</SelectItem>
                                                    <SelectItem value="bus">Bus</SelectItem>
                                                    <SelectItem value="car">Car</SelectItem>
                                                    <SelectItem value="ferry">Ferry</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <div />
                            )}
                        </div>

                        {isStay ? (
                            <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="checkinDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Check-in Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
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
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="checkinTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Check-in Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="checkoutDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Check-out Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
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
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="checkoutTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Check-out Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {isTransport ? (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="startTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start time</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="endTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End time</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                ) : (
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
                                )}
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
                        )}

                        {isStay && (
                            <div className="grid grid-cols-2 gap-4">
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
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-4">
                                {isTransport ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="startLocation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start location</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Starting point"
                                                            {...field}
                                                            onChange={async (e) => {
                                                                field.onChange(e);
                                                                const value = e.target.value;
                                                                form.setValue('location', value);
                                                                if (value?.includes('maps.app.goo.gl') || value?.includes('google.com/maps')) {
                                                                    await resolveLocationInput(value, setStartCoords);
                                                                }
                                                            }}
                                                            onBlur={async (e) => {
                                                                const value = e.target.value;
                                                                if (value?.includes('maps.app.goo.gl') || value?.includes('google.com/maps')) {
                                                                    await resolveLocationInput(value, setStartCoords);
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="endLocation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End location</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Destination"
                                                            {...field}
                                                            onChange={async (e) => {
                                                                field.onChange(e);
                                                                const value = e.target.value;
                                                                if (value?.includes('maps.app.goo.gl') || value?.includes('google.com/maps')) {
                                                                    await resolveLocationInput(value, setEndCoords);
                                                                }
                                                            }}
                                                            onBlur={async (e) => {
                                                                const value = e.target.value;
                                                                if (value?.includes('maps.app.goo.gl') || value?.includes('google.com/maps')) {
                                                                    await resolveLocationInput(value, setEndCoords);
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {(form.watch('startLocation') && form.watch('endLocation')) && (
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                    const start = form.getValues('startLocation');
                                                    const endLoc = form.getValues('endLocation');
                                                    if (start) await resolveLocationInput(start, setStartCoords);
                                                    if (endLoc) await resolveLocationInput(endLoc, setEndCoords);
                                                }}
                                            >
                                                Resolve
                                            </Button>
                                        </div>
                                    )}
                                    <div>
                                        </div>
                                    </>
                                ) : (
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="Address, coordinates, or Google Maps link"
                                                            {...field}
                                                            onChange={async (e) => {
                                                                field.onChange(e);
                                                                const value = e.target.value;
                                                                const isGoogleLink = value?.includes('maps.app.goo.gl') || value?.includes('google.com/maps');
                                                                const resolveLink = async () => {
                                                                    if (!value) return;
                                                                    if (resolvedCache.current.has(value)) {
                                                                        const cached = resolvedCache.current.get(value);
                                                                        if (cached?.lat && cached?.lng) {
                                                                            setResolvedCoords({ lat: cached.lat, lng: cached.lng });
                                                                        }
                                                                        if (cached?.name && !form.getValues('name')) {
                                                                            form.setValue('name', cached.name);
                                                                        }
                                                                        if (cached?.address) {
                                                                            form.setValue('location', cached.address);
                                                                        }
                                                                        return;
                                                                    }
                                                                    setIsExpanding(true);
                                                                    try {
                                                                        const res = await api.get('/utils/resolve-map-link', { params: { url: value } });
                                                                        resolvedCache.current.set(value, res?.data || {});
                                                                        if (res?.data?.lat && res?.data?.lng) {
                                                                            setResolvedCoords({ lat: res.data.lat, lng: res.data.lng });
                                                                        }
                                                                        if (res?.data?.name && !form.getValues('name')) {
                                                                            form.setValue('name', res.data.name);
                                                                        }
                                                                        if (res?.data?.address) {
                                                                            form.setValue('location', res.data.address);
                                                                        }
                                                                        if (!res?.data?.name && !res?.data?.lat && res?.data?.expanded_url) {
                                                                            const parsed = parseGoogleMapsLink(res.data.expanded_url);
                                                                            if (parsed?.lat && parsed?.lng) setResolvedCoords({ lat: parsed.lat, lng: parsed.lng });
                                                                            if (parsed?.name && !form.getValues('name')) form.setValue('name', parsed.name);
                                                                        }
                                                                        if (!res?.data?.name && !res?.data?.lat) {
                                                                            toast.message('Could not extract details from this link');
                                                                        }
                                                                    } catch {
                                                                        toast.message('Could not resolve this link');
                                                                    } finally {
                                                                        setIsExpanding(false);
                                                                    }
                                                                };

                                                                if (isGoogleLink && !isExpanding) {
                                                                    resolveLink();
                                                                    return;
                                                                }

                                                                const parsed = value ? parseGoogleMapsLink(value) : null;
                                                                if (parsed?.lat && parsed?.lng) {
                                                                    setResolvedCoords({ lat: parsed.lat, lng: parsed.lng });
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                field.onBlur();
                                                                const value = e.target.value;
                                                                const parsed = value ? parseGoogleMapsLink(value) : null;
                                                                if (parsed) {
                                                                    if (parsed.lat && parsed.lng) {
                                                                        setResolvedCoords({ lat: parsed.lat, lng: parsed.lng });
                                                                    }
                                                                    if (parsed.name && !form.getValues('name')) {
                                                                        form.setValue('name', parsed.name);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        {isExpanding ? (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center gap-2 text-xs">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Resolving…
                                                            </div>
                                                        ) : (
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                                                                {locationValue?.includes('maps.app.goo.gl') || locationValue?.includes('google.com/maps') ? (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 px-2"
                                                                        onClick={async () => {
                                                                            const value = form.getValues('location');
                                                                            if (!value) return;
                                                                            setIsExpanding(true);
                                                                            try {
                                                                                const res = await api.get('/utils/resolve-map-link', { params: { url: value } });
                                                                                resolvedCache.current.set(value, res?.data || {});
                                                                                if (res?.data?.lat && res?.data?.lng) {
                                                                                    setResolvedCoords({ lat: res.data.lat, lng: res.data.lng });
                                                                                }
                                                                                if (res?.data?.name && !form.getValues('name')) {
                                                                                    form.setValue('name', res.data.name);
                                                                                }
                                                                                if (res?.data?.address) {
                                                                                    form.setValue('location', res.data.address);
                                                                                }
                                                                                if (!res?.data?.name && !res?.data?.lat && res?.data?.expanded_url) {
                                                                                    const parsed = parseGoogleMapsLink(res.data.expanded_url);
                                                                                    if (parsed?.lat && parsed?.lng) setResolvedCoords({ lat: parsed.lat, lng: parsed.lng });
                                                                                    if (parsed?.name && !form.getValues('name')) form.setValue('name', parsed.name);
                                                                                }
                                                                                if (!res?.data?.name && !res?.data?.lat) {
                                                                                    toast.message('Could not extract details from this link');
                                                                                }
                                                                            } catch {
                                                                                toast.message('Could not resolve this link');
                                                                            } finally {
                                                                                setIsExpanding(false);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Resolve
                                                                    </Button>
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                            </div>
                            {!isTransport && (
                                <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
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
                                            markers={isTransport ? transportMarkers : undefined}
                                            path={isTransport ? transportPath : undefined}
                                            height={260}
                                            onClick={onMapClick}
                                            rounded="rounded-2xl"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        {isTransport && (
                            <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
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
                                        markers={isTransport ? transportMarkers : undefined}
                                        path={isTransport ? transportPath : undefined}
                                        height={260}
                                        onClick={onMapClick}
                                        rounded="rounded-2xl"
                                    />
                                )}
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="Any extra details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex items-center justify-between">
                            <div>
                                {mode === 'edit' && activity && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-destructive border-destructive/30"
                                        onClick={() => {
                                            deleteActivity.mutate({ id: activity.id }, {
                                                onSuccess: () => {
                                                    toast.success('Activity deleted');
                                                    setShow(false);
                                                },
                                                onError: (error: any) => showError('Failed to delete activity', error)
                                            });
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {mode === 'edit' ? 'Save Changes' : 'Add'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
