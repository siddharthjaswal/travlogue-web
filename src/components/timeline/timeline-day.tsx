'use client';

import { TripDay } from '@/services/activity-service';
import { ActivityItem } from './activity-item';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { collectDayPlaces } from '@/lib/places';
import { AddActivityDialog } from './add-activity-dialog';
import { useTransits } from '@/hooks/use-transits';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAccommodation } from '@/hooks/use-accommodations';
import { toast } from 'sonner';
import { showError } from '@/lib/toast-helper';
import { useEffect, useState } from 'react';

interface StayInfo {
    name: string;
    nights: number;
    isStart: boolean;
    isEnd: boolean;
    checkInTime?: number | null;
    checkOutTime?: number | null;
    accommodations?: { id: number; accommodationType: 'check_in' | 'whole_day' | 'check_out'; name: string; address?: string | null; cost?: number | null; currency?: string; notes?: string | null; checkInTime?: number | null; checkOutTime?: number | null }[];
}

interface TimelineDayProps {
    day: TripDay;
    stayInfo?: StayInfo;
}

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

export function TimelineDay({ day, stayInfo }: TimelineDayProps) {
    const dateObj = new Date(day.date);
    const updateAccommodation = useUpdateAccommodation();
    const [editStayOpen, setEditStayOpen] = useState(false);

    const stayRecord = stayInfo?.accommodations?.find(a => a.accommodationType === 'check_in') || stayInfo?.accommodations?.[0];
    const checkoutRecord = stayInfo?.accommodations?.find(a => a.accommodationType === 'check_out');

    const [stayName, setStayName] = useState(stayRecord?.name || '');
    const [stayAddress, setStayAddress] = useState(stayRecord?.address || '');
    const [stayNotes, setStayNotes] = useState(stayRecord?.notes || '');
    const [stayCost, setStayCost] = useState(stayRecord?.cost ? String(stayRecord.cost) : '');
    const [stayCurrency, setStayCurrency] = useState(stayRecord?.currency || 'USD');
    const [stayCheckInTime, setStayCheckInTime] = useState(stayRecord?.checkInTime ? new Date(stayRecord.checkInTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
    const [stayCheckOutTime, setStayCheckOutTime] = useState(checkoutRecord?.checkOutTime ? new Date(checkoutRecord.checkOutTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '');

    // Format: "JAN, FRI"
    const monthName = format(dateObj, 'MMM').toUpperCase();
    const dayName = format(dateObj, 'EEEE').toUpperCase(); // Full day name

    const nextTime = getNextDefaultTime(day.activities);
    const { data: transits } = useTransits(day.id);

    useEffect(() => {
        if (stayRecord) {
            setStayName(stayRecord.name || '');
            setStayAddress(stayRecord.address || '');
            setStayNotes(stayRecord.notes || '');
            setStayCost(stayRecord.cost ? String(stayRecord.cost) : '');
            setStayCurrency(stayRecord.currency || 'USD');
            setStayCheckInTime(stayRecord.checkInTime ? new Date(stayRecord.checkInTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
            setStayCheckOutTime(checkoutRecord?.checkOutTime ? new Date(checkoutRecord.checkOutTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
        }
    }, [stayRecord?.id, checkoutRecord?.id]);

    const toUnix = (time?: string | null, baseDate?: Date) => {
        if (!time || !baseDate) return null;
        const [h, m] = time.split(':').map(Number);
        const dt = new Date(baseDate);
        dt.setHours(h || 0, m || 0, 0, 0);
        return Math.floor(dt.getTime() / 1000);
    };

    const handleSaveStay = async () => {
        if (!stayInfo?.accommodations || stayInfo.accommodations.length === 0) return;
        try {
            const checkInBase = stayRecord?.checkInTime ? new Date(stayRecord.checkInTime * 1000) : dateObj;
            const checkOutBase = checkoutRecord?.checkOutTime ? new Date(checkoutRecord.checkOutTime * 1000) : dateObj;

            const updates = stayInfo.accommodations.map(acc => {
                const payload: any = {
                    name: stayName,
                    address: stayAddress || null,
                    notes: stayNotes || null,
                };

                if (acc.accommodationType === 'check_in') {
                    payload.checkInTime = toUnix(stayCheckInTime, checkInBase);
                    payload.cost = stayCost ? Number(stayCost) : null;
                    payload.currency = stayCurrency || 'USD';
                }

                if (acc.accommodationType === 'check_out') {
                    payload.checkOutTime = toUnix(stayCheckOutTime, checkOutBase);
                }

                return updateAccommodation.mutateAsync({ id: acc.id, data: payload });
            });

            await Promise.all(updates);
            toast.success('Stay updated');
            setEditStayOpen(false);
        } catch (error: any) {
            showError('Failed to update stay', error);
        }
    };

    return (
        <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-[70px_1fr] gap-4 md:gap-4 mb-10 sm:mb-16">
                {/* Day Header */}
                <div className="relative mb-2 md:mb-0 pt-1">
                    <div className="md:sticky md:top-32 flex md:justify-start">
                        <div className="flex items-center md:flex-col md:items-start gap-3 md:gap-1">
                            <div className="h-10 w-10 rounded-full bg-muted/60 border border-border/50 flex items-center justify-center text-foreground font-semibold">
                                {format(dateObj, 'd')}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                                    {monthName}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    {dayName.slice(0,3)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Column */}
                <div className="relative">
                    <div className="space-y-4">
                        {stayInfo && stayInfo.isStart && (
                            <div className="group mb-4 flex items-center justify-between rounded-md border border-border/30 bg-[#8FB7FF]/18 px-3 py-2 text-xs text-muted-foreground">
                                <div>
                                    Stay · {stayInfo.name} · {stayInfo.nights} night{stayInfo.nights === 1 ? '' : 's'}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setEditStayOpen(true)}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        {stayInfo && !stayInfo.isStart && (
                            <div className="mb-3 inline-flex rounded-full border border-border/30 bg-[#8FB7FF]/18 px-3 py-1 text-[11px] text-muted-foreground">
                                Continuing stay · {stayInfo.name}
                            </div>
                        )}

                        {/* Add button moved to bottom */}

                        {/* Transits */}
                        {transits && transits.length > 0 && (
                            <div className="mb-6">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Transport</div>
                                <div className="space-y-3">
                                    {transits.map((t) => (
                                        <div key={t.id} className="rounded-xl border border-border/40 bg-muted/20 p-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium capitalize">{t.transitMode}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t.departureTime && t.departureTimezone
                                                        ? new Intl.DateTimeFormat('en-US', { timeZone: t.departureTimezone, hour: '2-digit', minute: '2-digit' }).format(new Date(t.departureTime * 1000))
                                                        : t.departureTime ? new Date(t.departureTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    {t.arrivalTime ? ' → ' : ''}
                                                    {t.arrivalTime && t.arrivalTimezone
                                                        ? new Intl.DateTimeFormat('en-US', { timeZone: t.arrivalTimezone, hour: '2-digit', minute: '2-digit' }).format(new Date(t.arrivalTime * 1000))
                                                        : t.arrivalTime ? new Date(t.arrivalTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {t.fromLocation} {t.toLocation ? `→ ${t.toLocation}` : ''}
                                            </div>
                                            {t.carrier && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {t.carrier} {t.flightNumber ? `• ${t.flightNumber}` : ''}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activities List */}
                        <div className="space-y-5">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activities</div>
                            {day.activities.length > 0 ? (
                                day.activities
                                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                                    .map((activity) => (
                                        <ActivityItem
                                            key={activity.id}
                                            activity={activity}
                                            tripId={day.tripId}
                                            date={dateObj}
                                            dayPlace={day.place}
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

                        {/* City Labels + Add */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex flex-wrap justify-center gap-2">
                                {collectDayPlaces({
                                    dayPlace: day.place,
                                    activityLocations: day.activities.map((a) => a.location),
                                    transitLocations: (transits || []).flatMap((t) => [t.fromLocation, t.toLocation]),
                                    stayLocations: stayInfo?.accommodations?.map((a) => a.address || a.name) || [],
                                }).map((place, idx) => (
                                    <div key={`${place}-${idx}`} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{place}</span>
                                    </div>
                                ))}
                            </div>
                            <AddActivityDialog
                                tripId={day.tripId}
                                initialDate={dateObj}
                                initialTime={nextTime}
                                trigger={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-full text-muted-foreground"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Add
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={editStayOpen} onOpenChange={setEditStayOpen}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Edit stay</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stay name</label>
                            <Input value={stayName} onChange={(e) => setStayName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</label>
                            <Input value={stayAddress} onChange={(e) => setStayAddress(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Check-in time</label>
                                <Input type="time" value={stayCheckInTime} onChange={(e) => setStayCheckInTime(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Check-out time</label>
                                <Input type="time" value={stayCheckOutTime} onChange={(e) => setStayCheckOutTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost</label>
                                <Input value={stayCost} onChange={(e) => setStayCost(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Currency</label>
                                <Input value={stayCurrency} onChange={(e) => setStayCurrency(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</label>
                            <Textarea value={stayNotes} onChange={(e) => setStayNotes(e.target.value)} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditStayOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveStay} disabled={updateAccommodation.isPending}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
