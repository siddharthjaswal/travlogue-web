'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DestinationSearch } from './destination-search';

const DESTINATIONS = [
  {
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=85&fit=crop&auto=format',
    tagline: 'City of Light',
  },
  {
    city: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=85&fit=crop&auto=format',
    tagline: 'Ancient & Timeless',
  },
  {
    city: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=85&fit=crop&auto=format',
    tagline: 'Island of Dreams',
  },
  {
    city: 'Patagonia',
    country: 'Argentina',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=85&fit=crop&auto=format',
    tagline: 'Edge of the World',
  },
  {
    city: 'New York',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1920&q=85&fit=crop&auto=format',
    tagline: 'The City That Never Sleeps',
  },
  {
    city: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=85&fit=crop&auto=format',
    tagline: 'Island of the Gods',
  },
];

const STATS = [
  { value: '2,400+', label: 'Trips planned' },
  { value: '180+', label: 'Destinations' },
  { value: '50K+', label: 'Activities logged' },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % DESTINATIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Preload next image
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % DESTINATIONS.length;
    if (!imagesLoaded[nextIndex]) {
      const img = new Image();
      img.src = DESTINATIONS[nextIndex].image;
      img.onload = () => setImagesLoaded(prev => ({ ...prev, [nextIndex]: true }));
    }
  }, [currentIndex, imagesLoaded]);

  const current = DESTINATIONS[currentIndex];

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Ken Burns zoom */}
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: 7, ease: 'linear' }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image}
              alt={current.city}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Multi-layer gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Top spacer for navbar */}
        <div className="h-20" />

        {/* Main hero content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          {/* Current destination label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`label-${currentIndex}`}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="h-px w-8 bg-white/40" />
              <span className="text-white/60 text-sm tracking-[0.2em] uppercase font-medium">
                {current.city}, {current.country}
              </span>
              <span className="h-px w-8 bg-white/40" />
            </motion.div>
          </AnimatePresence>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white text-center leading-[1.0] tracking-tight max-w-5xl mx-auto mb-4"
          >
            Plan your trip.
            <br />
            <span className="gradient-text-travel">
              Live the adventure.
            </span>
          </motion.h1>

          {/* Tagline */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`tag-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white/50 text-lg md:text-xl font-light italic text-center mb-12"
            >
              &ldquo;{current.tagline}&rdquo;
            </motion.p>
          </AnimatePresence>

          {/* Search widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-2xl relative"
          >
            <DestinationSearch />
          </motion.div>

          {/* Popular quick-links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-2 mt-5 flex-wrap justify-center"
          >
            <span className="text-white/35 text-xs">Trending:</span>
            {['Paris', 'Tokyo', 'Bali', 'Barcelona', 'NYC'].map(city => (
              <a
                key={city}
                href={`/login?destination=${encodeURIComponent(city)}`}
                className="px-3 py-1 rounded-full text-xs text-white/60 border border-white/15 hover:border-white/35 hover:text-white/90 transition-all"
              >
                {city}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center gap-8 md:gap-12"
              >
                {STATS.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-white text-xl md:text-2xl font-bold">{stat.value}</div>
                    <div className="text-white/45 text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Slide indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex items-center gap-3"
              >
                <span className="text-white/30 text-xs uppercase tracking-widest">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(DESTINATIONS.length).padStart(2, '0')}
                </span>
                <div className="flex gap-1.5">
                  {DESTINATIONS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-0.5 rounded-full transition-all duration-500 ${
                        i === currentIndex
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
