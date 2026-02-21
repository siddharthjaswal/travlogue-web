'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { PublicTrips } from '@/components/landing/public-trips';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
            {/* Elegant Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/8 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/6 rounded-full blur-[140px] -z-10" />

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/40 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Start planning your next adventure
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Travel Planning
                        <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                            Made Effortless
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Create beautiful itineraries, collaborate with travel companions, 
                        and turn your wanderlust into well-organized adventures.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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

                {/* Feature Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-4 mt-16 max-w-3xl mx-auto"
                >
                    {[
                        { icon: MapPin, text: "Beautiful Itineraries" },
                        { icon: Calendar, text: "Smart Planning" },
                        { icon: Sparkles, text: "Effortless Organization" }
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

                {/* Trip Showcase Preview */}
                <motion.div
                    initial={{ rotateX: 20, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative mt-24 h-[300px] md:h-[400px] w-full max-w-5xl mx-auto"
                    style={{ perspective: '1000px' }}
                >
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-border/40 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-background/95 to-muted/50" />
                        <div className="absolute inset-0">
                            <PublicTrips variant="hero" />
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md px-4 py-3">
                            <div className="text-sm font-semibold">Summer in Italy</div>
                            <div className="mt-1 text-xs text-muted-foreground">Feb 12 – Feb 19, 2026 • 7 days</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-[10px]">Rome</span>
                                <span className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-[10px]">Naples</span>
                                <span className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-[10px]">Amalfi</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
