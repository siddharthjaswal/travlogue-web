'use client';

import { TripDay } from '@/services/activity-service';
import { ActivityItem } from './activity-item';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { AddActivityDialog } from './add-activity-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateActivity } from '@/hooks/use-trips';
import { useState } from 'react';
import { toast } from 'sonner';

interface TimelineDayProps {
    day: TripDay;
}

const templates = [
    { label: 'Breakfast', type: 'dining' },
    { label: 'Lunch', type: 'dining' },
    { label: 'Dinner', type: 'dining' },
    { label: 'Check-in', type: 'accommodation' },
    { label: 'Check-out', type: 'accommodation' },
    { label: 'Museum', type: 'sightseeing' },
    { label: 'City Walk', type: 'sightseeing' },
    { label: 'Transit', type: 'transit' },
];

function getNextDefaultTime(activities: TripDay['activities']): string {
    const times = activities
        .map(a => a.time)
        .filter(Boolean) as string[];

    if (times.length === 0) return '09:00';

    const last = times.sort().slice(-1)[0];
    const [h, m] = last.split(':').map(Number);
    const nextH = Math.min((h + 1), 23);
    return `${String(nextH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

export function TimelineDay({ day }: TimelineDayProps) {
    const dateObj = new Date(day.date);

    // Format: "JAN, FRI"
    const monthName = format(dateObj, 'MMM').toUpperCase();
    const dayName = format(dateObj, 'EEEE').toUpperCase(); // Full day name

    const nextTime = getNextDefaultTime(day.activities);
    const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
    const [quickName, setQuickName] = useState('');
    const [quickTime, setQuickTime] = useState(nextTime);
    const [quickType, setQuickType] = useState('sightseeing');

    const submitQuickAdd = () => {
        if (!quickName.trim()) return;
        createActivity({
            tripId: day.tripId,
            activityDate: day.date,
            name: quickName.trim(),
            activityType: quickType,
            time: quickTime || undefined,
        }, {
            onSuccess: () => {
                setQuickName('');
                setQuickTime(getNextDefaultTime(day.activities));
                setQuickType('sightseeing');
                toast.success('Activity added');
            },
            onError: () => toast.error('Failed to add activity')
        });
    };

    return (
        <div className="relative pl-8 md:pl-0">
            {/* Mobile Timeline Line */}
            <div className="absolute left-[-17px] top-0 bottom-0 w-px bg-border/50 md:hidden" />
            <div className="absolute left-[-21px] top-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background md:hidden" />

            <div className="md:grid md:grid-cols-[140px_1fr] gap-8 sm:gap-10 mb-12 sm:mb-16">
                {/* Day Header (Left Column) */}
                <div className="relative mb-6 md:mb-0 pt-1">
                    <div className="md:sticky md:top-32 flex md:justify-end">
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1">
                            <span className="text-4xl md:text-5xl font-bold text-foreground leading-none tracking-tight">
                                {format(dateObj, 'd')}
                            </span>
                            <div className="flex flex-col md:items-end">
                                <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                                    {monthName}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {dayName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Column (Right) */}
                <div className="relative">
                    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md p-6 shadow-sm">
                        {/* Location + Add */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{day.place}</span>
                                </div>
                                <div className="h-px w-20 bg-border/30 hidden md:block" />
                            </div>

                            <AddActivityDialog
                                tripId={day.tripId}
                                initialDate={dateObj}
                                initialTime={nextTime}
                                trigger={
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2 rounded-full"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Add Activity
                                    </Button>
                                }
                            />
                        </div>

                        {/* Quick Add */}
                        <div className="mb-5 rounded-xl border border-border/40 bg-muted/10 p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    placeholder="Quick add an activity…"
                                    value={quickName}
                                    onChange={(e) => setQuickName(e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="time"
                                    value={quickTime}
                                    onChange={(e) => setQuickTime(e.target.value)}
                                    className="w-full sm:w-32"
                                />
                                <Select value={quickType} onValueChange={setQuickType}>
                                    <SelectTrigger className="w-full sm:w-44">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sightseeing">Sightseeing</SelectItem>
                                        <SelectItem value="dining">Dining</SelectItem>
                                        <SelectItem value="transit">Transit</SelectItem>
                                        <SelectItem value="accommodation">Stay</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={submitQuickAdd} disabled={isCreating} className="gap-2">
                                    <PlusCircle className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {templates.map((t) => (
                                    <button
                                        key={t.label}
                                        type="button"
                                        onClick={() => {
                                            setQuickName(t.label);
                                            setQuickType(t.type);
                                        }}
                                        className="text-xs px-3 py-1 rounded-full border border-border/40 bg-background hover:bg-muted/40 transition-colors"
                                    >
                                        {t.label}
                                    </button>
                                ))}
                                <div className="text-xs text-muted-foreground flex items-center gap-1 px-2">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Templates
                                </div>
                            </div>
                        </div>

                        {/* Activities List */}
                        <div className="space-y-5">
                            {day.activities.length > 0 ? (
                                day.activities
                                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                                    .map((activity) => (
                                        <ActivityItem
                                            key={activity.id}
                                            activity={activity}
                                            tripId={day.tripId}
                                            date={dateObj}
                                        />
                                    ))
                            ) : (
                                <div className="group relative border-2 border-dashed border-border/40 hover:border-primary/20 rounded-2xl p-10 text-center bg-muted/5 transition-all hover:bg-muted/10">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <PlusCircle className="h-10 w-10 text-primary/20" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Free day</p>
                                    <p className="text-muted-foreground/60 text-xs mt-1">No activities planned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
