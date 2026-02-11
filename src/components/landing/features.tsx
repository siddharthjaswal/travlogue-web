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
        <section id="features" className="py-24 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                        Everything for your perfect journey
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        From inspiration to memories, Travlogue is your complete travel companion
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08, duration: 0.4 }}
                        >
                            <Card className="h-full group hover:shadow-lg transition-all">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-7 w-7" strokeWidth={1.5} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
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
