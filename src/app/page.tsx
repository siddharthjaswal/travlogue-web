'use client';

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrendingDestinations } from "@/components/landing/trending-destinations";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { PublicTrips } from "@/components/landing/public-trips";
import { CtaSection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <TrendingDestinations />
        <HowItWorks />
        <Features />
        <PublicTrips />
        <CtaSection />
      </main>
    </div>
  );
}
