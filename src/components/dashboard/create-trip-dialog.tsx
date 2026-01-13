'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { showError } from '@/lib/toast-helper';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useCreateTrip } from '@/hooks/use-trips';
import { CreateTripData } from '@/services/trip-service';

export function CreateTripDialog() {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const { mutate: createTrip, isPending } = useCreateTrip();

    // Simple form handling
    const [formData, setFormData] = useState<Partial<CreateTripData>>({
        name: '',
        description: '',
        primaryDestinationCountry: '',
        primaryDestinationCity: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) return;

        createTrip({
            name: formData.name,
            description: formData.description,
            primaryDestinationCountry: formData.primaryDestinationCountry,
            primaryDestinationCity: formData.primaryDestinationCity,
            // Convert JS Date to Unix Timestamp (seconds)
            startDateTimestamp: startDate ? Math.floor(startDate.getTime() / 1000) : undefined,
            endDateTimestamp: endDate ? Math.floor(endDate.getTime() / 1000) : undefined,
        }, {
            onSuccess: () => {
                setOpen(false);
                setFormData({ name: '', description: '', primaryDestinationCountry: '', primaryDestinationCity: '' });
                setStartDate(undefined);
                setEndDate(undefined);
                toast.success('Trip created successfully!');
            },
            onError: (error: any) => {
                console.error("Failed to create trip:", error);
                showError('Failed to create trip', error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Trip
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Trip</DialogTitle>
                        <DialogDescription>
                            Start planning your next adventure. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Trip Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Summer in Italy"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    placeholder="e.g. Italy"
                                    value={formData.primaryDestinationCountry}
                                    onChange={(e) => setFormData({ ...formData, primaryDestinationCountry: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">City (Optional)</Label>
                                <Input
                                    id="city"
                                    placeholder="e.g. Rome"
                                    value={formData.primaryDestinationCity}
                                    onChange={(e) => setFormData({ ...formData, primaryDestinationCity: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <DatePicker
                                    date={startDate}
                                    setDate={setStartDate}
                                    placeholder="Start Date"
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date</Label>
                                <DatePicker
                                    date={endDate}
                                    setDate={setEndDate}
                                    placeholder="End Date"
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (date < today) return true;
                                        if (startDate && date < startDate) return true;
                                        return false;
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="What's this trip about?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Trip
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
