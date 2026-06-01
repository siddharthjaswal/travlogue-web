'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  CalendarDays, Users, Wallet, CloudSun, Route,
  Plane, TrendingUp, Bell, Wind, Droplets
} from 'lucide-react';
import { getWeatherLabel } from '@/lib/weather';
import { FlightSearch } from '@/components/trips/flight-search';

// Mini live weather demo component
function LiveWeatherDemo() {
  const [weather, setWeather] = useState<{ temp: number; code: number; humidity: number; wind: number } | null>(null);

  useEffect(() => {
    fetch('/api/weather?lat=48.8566&lng=2.3522&days=1')
      .then(r => r.json())
      .then(d => setWeather({
        temp: d.current.temperature,
        code: d.current.weatherCode,
        humidity: d.current.humidity,
        wind: d.current.windSpeed,
      }))
      .catch(() => setWeather({ temp: 22, code: 1, humidity: 58, wind: 14 }));
  }, []);

  const info = weather ? getWeatherLabel(weather.code, 1) : null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center">
            <CloudSun className="h-4 w-4 text-teal-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Paris, France</span>
        </div>
        <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted/50">Live</span>
      </div>
      {weather && info ? (
        <>
          <div className="flex items-end gap-3">
            <span className="text-5xl">{info.emoji}</span>
            <div>
              <div className="text-4xl font-bold text-foreground">{weather.temp}°C</div>
              <div className="text-sm text-muted-foreground">{info.label}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <span>Humidity {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wind className="h-3.5 w-3.5 text-teal-400" />
              <span>Wind {weather.wind} km/h</span>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 rounded bg-primary/20 hover:bg-primary/40 transition-colors" style={{ height: `${20 + Math.sin(i) * 12}px` }} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">7-day forecast</div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="h-12 rounded-lg bg-muted/40 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Real Duffel flight search demo
function FlightSearchDemo() {
  return (
    <FlightSearch
      defaultOrigin="LHR"
      defaultDestination="CDG"
      compact
    />
  );
}

// Mini collaboration demo
function CollabDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 1800);
    return () => clearInterval(t);
  }, []);

  const events = [
    { user: 'Maya', action: 'added Eiffel Tower visit', time: 'Just now', avatar: 'M', color: 'bg-violet-500' },
    { user: 'Alex', action: 'updated hotel booking', time: '2m ago', avatar: 'A', color: 'bg-blue-500' },
    { user: 'Sam', action: 'added $240 expense', time: '5m ago', avatar: 'S', color: 'bg-orange-500' },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-semibold text-foreground">Team activity</span>
        <div className="ml-auto flex -space-x-2">
          {events.map((e, i) => (
            <div key={i} className={`w-6 h-6 rounded-full ${e.color} border-2 border-card flex items-center justify-center text-white text-[9px] font-bold`}>
              {e.avatar}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {events.map((e, i) => (
          <motion.div
            key={i}
            animate={{ opacity: step === i ? 1 : 0.45, scale: step === i ? 1.01 : 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/30"
          >
            <div className={`w-7 h-7 rounded-full ${e.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {e.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground font-medium">{e.user}</span>
              <span className="text-sm text-muted-foreground"> {e.action}</span>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{e.time}</span>
          </motion.div>
        ))}
      </div>
      {step < events.length && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/20"
        >
          <Bell className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-primary">New update from your team</span>
        </motion.div>
      )}
    </div>
  );
}

// Mini budget demo
function BudgetDemo() {
  const categories = [
    { name: 'Flights', amount: 480, total: 1200, color: 'bg-blue-500' },
    { name: 'Hotels', amount: 340, total: 1200, color: 'bg-violet-500' },
    { name: 'Food', amount: 180, total: 1200, color: 'bg-orange-500' },
    { name: 'Activities', amount: 200, total: 1200, color: 'bg-teal-500' },
  ];
  const spent = categories.reduce((s, c) => s + c.amount, 0);
  const budget = 1200;
  const pct = Math.round((spent / budget) * 100);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-semibold text-foreground">Trip budget</span>
        <span className="ml-auto text-xs text-muted-foreground">Paris, 7 days</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Spent</span>
          <span className="font-bold text-foreground">${spent} <span className="text-muted-foreground font-normal">/ ${budget}</span></span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{pct}% used</span>
          <span className="text-green-400 font-medium">${budget - spent} remaining</span>
        </div>
      </div>
      <div className="space-y-2">
        {categories.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${c.color} flex-shrink-0`} />
            <span className="text-xs text-muted-foreground flex-1">{c.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(c.amount / c.total) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                className={`h-full rounded-full ${c.color}`}
              />
            </div>
            <span className="text-xs font-medium text-foreground w-10 text-right">${c.amount}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <TrendingUp className="h-3 w-3 text-green-400" />
        <span>Under budget — great job!</span>
      </div>
    </div>
  );
}

const SPOTLIGHTS = [
  {
    tag: 'Itinerary',
    icon: CalendarDays,
    title: 'Day-by-day planning, without the mess',
    description: 'Build your perfect itinerary with drag-and-drop simplicity. Activities, hotels, and transport — all organized chronologically so nothing gets missed.',
    bullets: ['Drag & drop activities', 'Auto-generated trip days', 'Visual timeline view'],
    demo: null,
    accent: 'text-blue-400',
    reverse: false,
  },
  {
    tag: 'Live Weather',
    icon: CloudSun,
    title: 'Know before you go',
    description: 'See real-time weather for your destination and get a 7-day forecast for your travel dates. Know whether to pack a raincoat or sunscreen.',
    bullets: ['Current conditions', '16-day forecast', 'Trip date highlights'],
    demo: <LiveWeatherDemo />,
    accent: 'text-teal-400',
    reverse: true,
  },
  {
    tag: 'Flights',
    icon: Plane,
    title: 'Find the cheapest flights, instantly',
    description: 'Search and compare flights from your home airport to any destination. Save the best option directly to your trip itinerary.',
    bullets: ['Real-time pricing', 'Price calendar', 'Save to itinerary'],
    demo: <FlightSearchDemo />,
    accent: 'text-primary',
    reverse: false,
  },
  {
    tag: 'Collaborate',
    icon: Users,
    title: 'Plan together, travel better',
    description: 'Invite friends and family to your trip. Everyone can add activities, vote on options, and see live updates as the plan comes together.',
    bullets: ['Real-time sync', 'Role-based access', 'Activity feed'],
    demo: <CollabDemo />,
    accent: 'text-violet-400',
    reverse: true,
  },
  {
    tag: 'Budget',
    icon: Wallet,
    title: 'Track every dollar, across currencies',
    description: 'Add expenses as you plan. Split costs with travel companions. See live exchange rates so you always know your real spend.',
    bullets: ['Multi-currency', 'Expense splitting', 'Budget alerts'],
    demo: <BudgetDemo />,
    accent: 'text-orange-400',
    reverse: false,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-4">
            Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything your trip needs
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From first search to last memory — Travlogue has you covered at every step.
          </p>
        </motion.div>

        {/* Spotlight rows */}
        <div className="space-y-24">
          {SPOTLIGHTS.map((spot, i) => (
            <SpotlightRow key={i} spot={spot} />
          ))}
        </div>
      </div>
    </section>
  );
}

const TIMELINE_DAYS = [
  { day: 'Day 1 · Paris', items: ['Eiffel Tower', 'Louvre Museum', 'Seine Cruise'], time: '9:00 AM' },
  { day: 'Day 2 · Versailles', items: ['Palace of Versailles', 'Gardens walk'], time: '8:30 AM' },
  { day: 'Day 3 · Paris', items: ['Montmartre', 'Sacré-Cœur', 'Dinner'], time: '10:00 AM' },
];

function SpotlightRow({ spot }: { spot: typeof SPOTLIGHTS[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${spot.reverse ? 'md:[&>*:first-child]:order-2' : ''}`}
    >
      {/* Text side */}
      <div className="space-y-6">
        <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${spot.accent}`}>
          <spot.icon className="h-4 w-4" />
          {spot.tag}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {spot.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {spot.description}
        </p>
        <ul className="space-y-2">
          {spot.bullets.map((b, j) => (
            <li key={j} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className={`w-1.5 h-1.5 rounded-full ${spot.accent.replace('text-', 'bg-')}`} />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Demo side */}
      <div className="rounded-3xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm">
        {spot.demo ?? (
          <div className="space-y-3">
            {TIMELINE_DAYS.map((d, j) => (
              <motion.div
                key={j}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + j * 0.1 }}
                className="rounded-xl border border-border/50 bg-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground">{d.day}</span>
                  <span className="text-[10px] text-muted-foreground">{d.time}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.items.map((item, k) => (
                    <span key={k} className="px-2.5 py-1 rounded-full bg-muted/50 text-[11px] text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
