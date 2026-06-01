'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWeatherLabel } from '@/lib/weather';

interface CityWeather {
  city: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  temp?: number;
  weatherCode?: number;
  isDay?: number;
}

const CITIES: CityWeather[] = [
  { city: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.8566, lng: 2.3522 },
  { city: 'Tokyo', country: 'Japan', flag: '🇯🇵', lat: 35.6762, lng: 139.6503 },
  { city: 'Bali', country: 'Indonesia', flag: '🇮🇩', lat: -8.3405, lng: 115.092 },
  { city: 'New York', country: 'USA', flag: '🇺🇸', lat: 40.7128, lng: -74.006 },
  { city: 'Dubai', country: 'UAE', flag: '🇦🇪', lat: 25.2048, lng: 55.2708 },
  { city: 'London', country: 'UK', flag: '🇬🇧', lat: 51.5074, lng: -0.1278 },
  { city: 'Singapore', country: 'Singapore', flag: '🇸🇬', lat: 1.3521, lng: 103.8198 },
  { city: 'Barcelona', country: 'Spain', flag: '🇪🇸', lat: 41.3851, lng: 2.1734 },
  { city: 'Sydney', country: 'Australia', flag: '🇦🇺', lat: -33.8688, lng: 151.2093 },
  { city: 'Rome', country: 'Italy', flag: '🇮🇹', lat: 41.9028, lng: 12.4964 },
];

export function TrendingDestinations() {
  const [cities, setCities] = useState<CityWeather[]>(CITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      const results = await Promise.allSettled(
        CITIES.map(async city => {
          const res = await fetch(`/api/weather?lat=${city.lat}&lng=${city.lng}&days=1`);
          if (!res.ok) throw new Error('failed');
          const data = await res.json();
          return {
            ...city,
            temp: data.current.temperature,
            weatherCode: data.current.weatherCode,
            isDay: data.current.isDay,
          };
        })
      );

      if (cancelled) return;

      const updated = results.map((r, i) =>
        r.status === 'fulfilled' ? r.value : CITIES[i]
      );
      setCities(updated);
      setLoading(false);
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Duplicate for infinite scroll effect
  const doubled = [...cities, ...cities];

  return (
    <section className="py-16 overflow-hidden bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Live weather
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Trending destinations
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Real-time conditions from around the world
          </p>
        </motion.div>
      </div>

      {/* Scrolling ticker */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll-ticker hover:[animation-play-state:paused]">
          {doubled.map((city, i) => {
            const weather = !loading && city.weatherCode !== undefined
              ? getWeatherLabel(city.weatherCode, city.isDay ?? 1)
              : null;

            return (
              <a
                key={`${city.city}-${i}`}
                href={`/login?destination=${encodeURIComponent(city.city)}`}
                className="flex-shrink-0 flex flex-col gap-3 mx-3 px-6 py-5 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:bg-card transition-all group cursor-pointer min-w-[160px]"
              >
                {/* Flag + city */}
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{city.flag}</span>
                  <div>
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                      {city.city}
                    </div>
                    <div className="text-xs text-muted-foreground">{city.country}</div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="flex items-end gap-2">
                  {loading || !weather ? (
                    <div className="h-8 w-20 rounded-lg bg-muted/50 animate-pulse" />
                  ) : (
                    <>
                      <span className="text-4xl leading-none">{weather.emoji}</span>
                      <div>
                        <div className="text-2xl font-bold text-foreground leading-none">
                          {city.temp}°C
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{weather.label}</div>
                      </div>
                    </>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
