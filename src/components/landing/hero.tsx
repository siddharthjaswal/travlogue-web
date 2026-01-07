'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, MapPin, Compass } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-48 md:pb-32">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[100px] -z-10 opacity-50 dark:opacity-20" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/30 rounded-full blur-[120px] -z-10 opacity-40" />

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Plan your next adventure
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                        Your Journey Begins with <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            Smart Planning
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Collaborate, organize, and explore. Travlogue brings your travel dreams to life with intuitive itineraries, expense tracking, and real-time collaboration.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/login">
                            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                                Start Planning Free
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

                {/* Floating Elements Animation */}
                <div className="relative mt-20 h-[300px] md:h-[400px] w-full max-w-5xl mx-auto perspective-[1000px]">
                    <motion.div
                        initial={{ rotateX: 20, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="relative w-full h-full bg-background border border-border/50 rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Mock UI for Dashboard Preview */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/50" />
                        <div className="absolute top-4 left-4 right-4 h-8 bg-muted/20 rounded-md flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400/80" />
                            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                            <div className="w-3 h-3 rounded-full bg-green-400/80" />
                        </div>
                        <div className="absolute top-16 left-4 w-60 h-32 bg-card border rounded-lg p-4 shadow-sm animate-pulse">
                            <div className="h-4 w-24 bg-primary/20 rounded mb-4" />
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-muted rounded" />
                                <div className="h-2 w-2/3 bg-muted rounded" />
                            </div>
                        </div>
                        <div className="absolute top-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
