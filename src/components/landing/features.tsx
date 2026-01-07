'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Wallet, Map, CheckSquare, CloudSun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
    {
        icon: Calendar,
        title: "Smart Itineraries",
        description: "Drag-and-drop planning with dates, times, and locations all in one place."
    },
    {
        icon: Users,
        title: "Real-time Collaboration",
        description: "Plan together with friends and family. See changes instantly as they happen."
    },
    {
        icon: Wallet,
        title: "Expense Tracking",
        description: "Keep track of shared expenses and settle debts easily with built-in tools."
    },
    {
        icon: Map,
        title: "Interactive Maps",
        description: "Visualize your trip on a map. Pin locations and find the optimal route."
    },
    {
        icon: CheckSquare,
        title: "Detailed Lists",
        description: "Never forget a thing with integrated packing lists and to-do checklists."
    },
    {
        icon: CloudSun,
        title: "Rich Journaling",
        description: "Capture memories with photos, notes, and mood tracking during your trip."
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for the perfect trip</h2>
                    <p className="text-muted-foreground text-lg">
                        From the first spark of inspiration to the final memory captured, Travlogue handles it all.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full border-border/50 bg-card hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
