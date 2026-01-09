'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Loader2, Pencil, PlusCircle } from 'lucide-react';
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
import { useCreateActivity, useUpdateActivity } from '@/hooks/use-trips';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Activity } from '@/services/activity-service';

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
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
    activity?: Activity;
}

export function AddActivityDialog({
    tripId,
    initialDate,
    trigger,
    open,
    onOpenChange,
    mode = 'create',
    activity
}: AddActivityDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
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
            time: '',
            location: '',
            cost: '',
            notes: '',
        },
    });

    // Reset/Populate form when dialog opens or mode/activity changes
    useEffect(() => {
        if (show) {
            if (mode === 'edit' && activity) {
                // Determine date. Activity doesn't strictly have date field in interface shown but it belongs to a tripDay which has date.
                // Actually Activity interface doesn't have date directly in UI models usually, but backend response might not have it flattened.
                // However, `initialDate` passed from parent `TimelineDay` is the correct date for that day.
                // We'll trust `initialDate` or try to parse from somewhere if needed.
                // Ideally activity object should have date if we were listing all activities flat.
                // But here we are editing inside a day, so date is fixed to that day usually.
                // Let's assume date is `initialDate`.

                form.reset({
                    name: activity.name,
                    activityType: activity.activityType.toLowerCase(),
                    date: initialDate || new Date(), // Keep date as is for now
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
                    time: '',
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
                    // Date update not supported in this simple flow yet (needs moving to valid day)
                }
            }, {
                onSuccess: () => {
                    toast.success('Activity updated');
                    setShow(false);
                },
                onError: (error: any) => {
                    toast.error('Failed to update activity');
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
                    const msg = error?.response?.data?.detail || error.message || 'Failed to add activity';
                    toast.error(`Error: ${msg}`);
                }
            });
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
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
                                                <SelectItem value="accommodation">Accommodation</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
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
                                                        disabled={mode === 'edit'} // Disable date change in edit for now to simplify
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
                                        <Input placeholder="Address or place name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
