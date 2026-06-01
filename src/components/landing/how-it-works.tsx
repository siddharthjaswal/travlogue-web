'use client';

import { motion } from 'framer-motion';
import { Search, CalendarDays, Plane, Users, MapPin, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Find your destination',
    description: 'Search any city or country. Get instant weather previews, flight price estimates, and destination highlights to spark your wanderlust.',
    highlights: ['Live weather', 'Flight prices', 'Best time to visit'],
    color: 'from-blue-500/20 to-cyan-500/10',
    accent: 'text-blue-400',
  },
  {
    number: '02',
    icon: CalendarDays,
    title: 'Build your itinerary',
    description: 'Plan day by day with smart suggestions. Add hotels, activities, and transport. Track your budget in real time with live currency rates.',
    highlights: ['Day-by-day planning', 'Budget tracking', 'Collaboration'],
    color: 'from-violet-500/20 to-purple-500/10',
    accent: 'text-violet-400',
  },
  {
    number: '03',
    icon: Plane,
    title: 'Book & travel',
    description: 'Link flights and trains directly to your itinerary. Share the plan with your crew. Everything stays in one place — online and offline.',
    highlights: ['Flight search', 'Team sharing', 'Offline access'],
    color: 'from-orange-500/20 to-amber-500/10',
    accent: 'text-orange-400',
  },
];

const CONNECTOR_ICONS = [MapPin, Users, CheckCircle2];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-4">
            How it works
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            From idea to adventure
            <br />
            <span className="gradient-text-travel">in three steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No spreadsheets. No chaos. Just a beautifully organized trip that actually happens.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-gradient-to-r from-border via-primary/30 to-border" />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative"
            >
              {/* Step number + icon */}
              <div className="flex flex-col items-center md:items-start mb-6">
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} border border-border flex items-center justify-center mb-4 shadow-lg`}>
                  <step.icon className={`h-6 w-6 ${step.accent}`} strokeWidth={1.5} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
                    <span className="text-[9px] font-bold text-muted-foreground">{step.number}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-5 text-sm">
                  {step.description}
                </p>

                {/* Highlight pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {step.highlights.map((h, j) => {
                    const Icon = CONNECTOR_ICONS[j];
                    return (
                      <span
                        key={j}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/50 bg-card ${step.accent}`}
                      >
                        <Icon className="h-3 w-3" />
                        {h}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
