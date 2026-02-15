'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTrips, useTripTimeline } from '@/hooks/use-trips';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MapPin, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const { data: trips, isLoading } = useTrips();
  const [tripId, setTripId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!tripId && trips?.length) setTripId(trips[0].id);
  }, [tripId, trips]);

  const { data: timeline, isLoading: isTimelineLoading } = useTripTimeline(tripId || 0);

  const tripDates = useMemo(() => {
    if (!timeline) return [] as Date[];
    return timeline.days.map(d => new Date(d.date)).filter(d => !isNaN(d.getTime()));
  }, [timeline]);

  const selectedDay = useMemo(() => {
    if (!timeline || !selectedDate) return null;
    const key = format(selectedDate, 'yyyy-MM-dd');
    return timeline.days.find(d => d.date === key) || null;
  }, [timeline, selectedDate]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground mt-2">View your trip schedule at a glance.</p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={tripId ? String(tripId) : ''} onValueChange={(v) => setTripId(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select trip" />
            </SelectTrigger>
            <SelectContent>
              {trips?.map((t: any) => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        <Card className="rounded-2xl border-border/50 shadow-sm p-4">
          {isLoading || isTimelineLoading ? (
            <Skeleton className="h-72 w-full rounded-xl" />
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              defaultMonth={selectedDate}
              modifiers={{ trip: tripDates }}
              modifiersClassNames={{ trip: 'bg-primary text-primary-foreground' }}
              classNames={{
                root: 'p-2',
                months: 'flex gap-8 flex-col relative',
                head_cell: 'text-muted-foreground/60 font-medium text-xs w-10 h-10 tracking-wider',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20',
                day: 'h-10 w-10 p-0 font-medium text-foreground/80 aria-selected:opacity-100 hover:bg-muted/50 rounded-lg transition-all duration-200 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md shadow-primary/20',
                day_today: 'font-bold text-primary ring-2 ring-primary/50 aria-selected:ring-2 aria-selected:ring-primary/80 aria-selected:border-2 aria-selected:border-primary/90 aria-selected:bg-primary aria-selected:text-primary-foreground',
                day_outside: 'text-muted-foreground/20 opacity-30',
                day_disabled: 'text-muted-foreground/20 opacity-30',
                day_hidden: 'invisible',
                nav_button: 'border-0 hover:bg-muted/50 text-foreground/60 hover:text-foreground transition-colors',
                caption: 'flex justify-center pt-2 relative items-center text-foreground font-bold text-lg mb-6 tracking-tight',
                weeks: 'space-y-3',
              }}
            />
          )}
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm p-6">
          {isTimelineLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : selectedDay ? (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(new Date(selectedDay.date), 'PPP')}</span>
                <Badge variant="secondary" className="rounded-full">{selectedDay.activities.length} activities</Badge>
              </div>

              <div className="space-y-4">
                {selectedDay.activities.length > 0 ? selectedDay.activities.map(a => (
                  <div key={a.id} className="rounded-xl border border-border/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold truncate">{a.name}</div>
                      <span className="text-xs text-muted-foreground">{a.time || 'Any'}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">{a.activityType}</Badge>
                      {a.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {a.location}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground">No activities planned for this day.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Select a day to view activities.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
