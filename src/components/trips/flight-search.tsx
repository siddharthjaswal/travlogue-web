'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, ArrowRight, Loader2, AlertCircle, Clock,
  Users, ChevronDown, RotateCcw, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FlightOffer } from '@/lib/flights';

const CABIN_OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(parseFloat(amount));
}

interface FlightCardProps {
  offer: FlightOffer;
  isFirst: boolean;
}

function FlightCard({ offer, isFirst }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const outbound = offer.slices[0];
  const inbound = offer.slices[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border transition-all ${
        isFirst
          ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border/50 bg-card/60'
      }`}
    >
      <div className="p-4">
        {isFirst && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Best price
          </div>
        )}

        {/* Airline + price row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {offer.owner.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offer.owner.logoUrl} alt={offer.owner.name} className="h-6 w-6 rounded object-contain" />
            ) : (
              <div className="h-6 w-6 rounded bg-muted/50 flex items-center justify-center">
                <Plane className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm font-medium text-foreground">{offer.owner.name}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              {formatPrice(offer.totalAmount, offer.totalCurrency)}
            </div>
            <div className="text-xs text-muted-foreground">
              per person · {offer.passengerCount > 1 ? `${offer.passengerCount} pax` : 'economy'}
            </div>
          </div>
        </div>

        {/* Flight route(s) */}
        {offer.slices.map((slice, i) => (
          <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'mt-2 pt-2 border-t border-border/30' : ''}`}>
            <div className="text-center min-w-[3rem]">
              <div className="text-sm font-bold text-foreground">{formatTime(slice.departureAt)}</div>
              <div className="text-[10px] text-muted-foreground">{slice.origin}</div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {slice.duration}
                {slice.stops > 0 && (
                  <span className="text-orange-400 ml-1">{slice.stops} stop{slice.stops > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-border/60" />
                <Plane className="h-3 w-3 text-muted-foreground rotate-0" />
                <div className="flex-1 h-px bg-border/60" />
              </div>
              <div className="text-[10px] text-muted-foreground">{formatDate(slice.departureAt)}</div>
            </div>

            <div className="text-center min-w-[3rem]">
              <div className="text-sm font-bold text-foreground">{formatTime(slice.arrivalAt)}</div>
              <div className="text-[10px] text-muted-foreground">{slice.destination}</div>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide details' : 'View segments'}
          </button>
          <div className="flex-1" />
          <Button size="sm" className="h-8 text-xs gap-1.5 shadow-sm">
            Book on Duffel
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        {/* Expanded segments */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                {outbound.segments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono font-bold text-foreground">{seg.flightNumber}</span>
                    <span>{seg.origin} → {seg.destination}</span>
                    <span className="ml-auto">{formatTime(seg.departureAt)} – {formatTime(seg.arrivalAt)}</span>
                    <span className="text-muted-foreground/60">{seg.duration}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface FlightSearchProps {
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDate?: string;
  compact?: boolean;
}

export function FlightSearch({ defaultOrigin = '', defaultDestination = '', defaultDate = '', compact = false }: FlightSearchProps) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [date, setDate] = useState(defaultDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState('economy');
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!origin || !destination || !date) return;
    setLoading(true);
    setError('');
    setOffers([]);
    setSearched(true);

    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin.toUpperCase().trim(),
          destination: destination.toUpperCase().trim(),
          departureDate: date,
          returnDate: returnDate || undefined,
          passengers,
          cabinClass: cabin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setOffers(data.offers ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search form */}
      <div className={`surface-1 rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center gap-2 mb-1">
          <Plane className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Flight search</span>
          <span className="ml-auto text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50">
            Powered by Duffel
          </span>
        </div>

        {/* Origin → Destination */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">From</label>
            <input
              type="text"
              placeholder="LHR"
              value={origin}
              onChange={e => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/50 text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 uppercase"
            />
          </div>
          <button
            onClick={() => { setOrigin(destination); setDestination(origin); }}
            className="mt-5 p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">To</label>
            <input
              type="text"
              placeholder="CDG"
              value={destination}
              onChange={e => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/50 text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 uppercase"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Depart</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/50 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Return (optional)</label>
            <input
              type="date"
              value={returnDate}
              min={date}
              onChange={e => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/50 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Passengers + Cabin */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Passengers</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 border border-border/50">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={passengers}
                onChange={e => setPassengers(parseInt(e.target.value))}
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} adult{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Cabin</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 border border-border/50">
              <select
                value={cabin}
                onChange={e => setCabin(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              >
                {CABIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={!origin || !destination || !date || loading}
          className="w-full h-10 text-sm font-semibold gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Searching flights...</>
          ) : (
            <><Plane className="h-4 w-4" /> Search flights</>
          )}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {!loading && searched && !error && offers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground text-sm"
          >
            No flights found for this route and date. Try different dates.
          </motion.div>
        )}

        {offers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {offers.length} result{offers.length > 1 ? 's' : ''} · sorted by price
              </span>
              <span className="text-xs text-muted-foreground">via Duffel</span>
            </div>
            {offers.map((offer, i) => (
              <FlightCard key={offer.id} offer={offer} isFirst={i === 0} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
