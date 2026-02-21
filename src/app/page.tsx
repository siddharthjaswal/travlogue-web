'use client';

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { PublicTrips } from "@/components/landing/public-trips";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <PublicTrips />
        <Features />
      </main>
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Travlogue. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
