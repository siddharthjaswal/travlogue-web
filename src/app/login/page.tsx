'use client';

import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/icons';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Globe, Shield } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85&fit=crop&auto=format',
    city: 'Paris, France',
    quote: 'The world is a book and those who do not travel read only one page.',
    author: 'Augustine of Hippo',
  },
  {
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=85&fit=crop&auto=format',
    city: 'Kyoto, Japan',
    quote: 'Travel is the only thing you buy that makes you richer.',
    author: 'Anonymous',
  },
  {
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85&fit=crop&auto=format',
    city: 'Santorini, Greece',
    quote: 'Not all those who wander are lost.',
    author: 'J.R.R. Tolkien',
  },
];

const FEATURES = [
  { icon: Globe, text: 'Plan trips to 180+ destinations' },
  { icon: MapPin, text: 'Day-by-day itinerary builder' },
  { icon: Shield, text: 'Secure · Private · Free' },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[slideIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 overflow-hidden">
        {SLIDES.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.image}
            src={s.image}
            alt={s.city}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === slideIndex ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Current location label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`city-${slideIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-8 left-8 z-20 flex items-center gap-2 text-white/50 text-xs"
        >
          <MapPin className="h-3 w-3" />
          {slide.city}
        </motion.div>
      </AnimatePresence>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 lg:hidden">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlideIndex(i)}
            className={`h-1 rounded-full transition-all ${i === slideIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>

      {/* Main content — split */}
      <div className="relative z-20 min-h-screen flex">
        {/* Left: branding + quote (desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-12 w-[55%]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 group-hover:scale-105 transition-transform">
              <Image src="/ic_travlogue.svg" alt="Travlogue" width={36} height={36} className="invert" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Travlogue</span>
          </Link>

          {/* Quote */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`quote-${slideIndex}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6 }}
              className="space-y-3 max-w-md"
            >
              <p className="text-white text-2xl font-light leading-relaxed italic">
                &ldquo;{slide.quote}&rdquo;
              </p>
              <p className="text-white/50 text-sm">— {slide.author}</p>

              {/* Slide indicators */}
              <div className="flex gap-1.5 pt-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    className={`h-0.5 rounded-full transition-all ${i === slideIndex ? 'w-8 bg-white' : 'w-3 bg-white/30'}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: login card */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Glass card */}
            <div className="rounded-3xl glass-dark p-8 space-y-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2.5 mb-2">
                <Image src="/ic_travlogue.svg" alt="Travlogue" width={28} height={28} className="invert" />
                <span className="text-white text-lg font-bold">Travlogue</span>
              </div>

              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                <p className="text-white/55 text-sm leading-relaxed">
                  Sign in to continue planning your next adventure
                </p>
              </div>

              {/* Google sign-in */}
              <Button
                onClick={login}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-white text-gray-900 hover:bg-white/90 font-semibold text-sm gap-3 shadow-lg transition-all active:scale-[0.98] border-0"
              >
                <GoogleIcon className="h-5 w-5 flex-shrink-0" />
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>

              {/* Feature list */}
              <div className="space-y-2.5 pt-1">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-white/45 text-xs">
                    <f.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    {f.text}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="text-center text-xs text-white/30 leading-relaxed">
                By continuing you agree to our{' '}
                <Link href="/terms" className="text-white/50 hover:text-white underline underline-offset-2 transition-colors">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-white/50 hover:text-white underline underline-offset-2 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
