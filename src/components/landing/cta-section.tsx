'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Github, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CtaSection() {
  return (
    <>
      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-teal-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold uppercase tracking-widest">
              Start free today
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Your next adventure
              <br />
              <span className="gradient-text-travel">starts here</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of travelers who plan smarter with Travlogue.
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-border bg-card/60 text-foreground font-semibold text-base hover:bg-card hover:border-border/80 transition-all"
              >
                See all features
              </Link>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Free forever · No credit card · Takes 30 seconds
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Image src="/ic_travlogue.svg" alt="Travlogue" width={32} height={32} className="invert" />
                </div>
                <span className="text-base font-bold text-foreground">Travlogue</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The travel planning app that makes the journey as good as the destination.
              </p>
              <div className="flex gap-3 mt-4">
                {[Twitter, Instagram, Github].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Product</div>
              <ul className="space-y-3">
                {['Features', 'How it works', 'Pricing', 'Changelog'].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Company</div>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Legal</div>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Travlogue. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Weather data by{' '}
              <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Open-Meteo
              </a>
              {' · '}
              Photos by{' '}
              <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Unsplash
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
