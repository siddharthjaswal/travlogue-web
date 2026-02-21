'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MapPin, Calendar, Route, Wallet } from 'lucide-react';
import { PublicTrips } from '@/components/landing/public-trips';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
            {/* Elegant Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/8 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/6 rounded-full blur-[140px] -z-10" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="max-w-4xl mx-auto text-center space-y-8"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/40 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Plan with clarity, travel with confidence
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Plan your trip like a pro —
                        <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                            without the chaos
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Day-by-day itinerary, stays, transport, and costs — all visible in one place.
                        Collaborate, stay organized, and actually enjoy planning.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link href="/login">
                            <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl">
                                Get Started Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                                Explore Features
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Hero Preview Grid */}
                <div className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.95fr_0.85fr] items-stretch">
                    {/* Left: Story Trip */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                        className="space-y-3 h-full"
                    >
                        <PublicTrips variant="showcase" />
                    </motion.div>

                    {/* Center: Timeline Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                        className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-5 shadow-lg h-full"
                    >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Route className="h-4 w-4 text-primary" />
                            Plan days, stays, and transport
                        </div>
                        <div className="mt-4 space-y-4 text-sm">
                            <div className="rounded-2xl border border-border/40 bg-background/60 px-4 py-3">
                                <div className="text-xs text-muted-foreground">Day 1 • Rome</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px]">Colosseum</span>
                                    <span className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px]">Trastevere</span>
                                    <span className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px]">Food Tour</span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-border/40 bg-background/60 px-4 py-3">
                                <div className="text-xs text-muted-foreground">Day 2 • Naples</div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full bg-primary/80" />
                                    <span>Train • 1h 20m</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px]">Street Food</span>
                                    <span className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px]">Spaccanapoli</span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-border/40 bg-background/60 px-4 py-3">
                                <div className="text-xs text-muted-foreground">Day 3 • Amalfi</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px]">Positano</span>
                                    <span className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px]">Sunset Cruise</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Map + Costs */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.6 }}
                        className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-5 shadow-lg h-full"
                    >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <MapPin className="h-4 w-4 text-primary" />
                            Map + cost snapshot
                        </div>
                        <div className="mt-4 rounded-2xl border border-border/40 bg-gradient-to-br from-slate-100/70 to-slate-200/60 h-36 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(96,165,250,0.25), transparent 40%), radial-gradient(circle at 70% 60%, rgba(34,197,94,0.2), transparent 45%)' }} />
                            <div className="absolute top-4 left-4 h-3 w-3 rounded-full bg-primary shadow" />
                            <div className="absolute bottom-6 right-6 h-3 w-3 rounded-full bg-accent shadow" />
                            <div className="absolute top-1/2 left-1/2 h-1 w-16 -translate-x-1/2 -translate-y-1/2 border-t-2 border-dashed border-primary/60" />
                        </div>
                        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/60 px-3 py-2">
                                <span className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Stays</span>
                                <span className="font-medium text-foreground">$480</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/60 px-3 py-2">
                                <span className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Transport</span>
                                <span className="font-medium text-foreground">$140</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/60 px-3 py-2">
                                <span className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Activities</span>
                                <span className="font-medium text-foreground">$210</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Feature Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-4 mt-14 max-w-3xl mx-auto"
                >
                    {[
                        { icon: MapPin, text: "Beautiful itineraries" },
                        { icon: Calendar, text: "Smart planning" },
                        { icon: Sparkles, text: "Effortless organization" }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/40 text-sm"
                        >
                            <feature.icon className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">{feature.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
