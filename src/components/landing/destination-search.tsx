'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Wind, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeatherLabel } from '@/lib/weather';

interface City {
  name: string;
  display: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
}

const POPULAR_CITIES: City[] = [
  { name: 'paris', display: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.8566, lng: 2.3522 },
  { name: 'tokyo', display: 'Tokyo', country: 'Japan', flag: '🇯🇵', lat: 35.6762, lng: 139.6503 },
  { name: 'bali', display: 'Bali', country: 'Indonesia', flag: '🇮🇩', lat: -8.3405, lng: 115.092 },
  { name: 'newyork', display: 'New York', country: 'USA', flag: '🇺🇸', lat: 40.7128, lng: -74.006 },
  { name: 'barcelona', display: 'Barcelona', country: 'Spain', flag: '🇪🇸', lat: 41.3851, lng: 2.1734 },
  { name: 'rome', display: 'Rome', country: 'Italy', flag: '🇮🇹', lat: 41.9028, lng: 12.4964 },
  { name: 'london', display: 'London', country: 'UK', flag: '🇬🇧', lat: 51.5074, lng: -0.1278 },
  { name: 'dubai', display: 'Dubai', country: 'UAE', flag: '🇦🇪', lat: 25.2048, lng: 55.2708 },
  { name: 'singapore', display: 'Singapore', country: 'Singapore', flag: '🇸🇬', lat: 1.3521, lng: 103.8198 },
  { name: 'bangkok', display: 'Bangkok', country: 'Thailand', flag: '🇹🇭', lat: 13.7563, lng: 100.5018 },
  { name: 'amsterdam', display: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', lat: 52.3676, lng: 4.9041 },
  { name: 'sydney', display: 'Sydney', country: 'Australia', flag: '🇦🇺', lat: -33.8688, lng: 151.2093 },
  { name: 'istanbul', display: 'Istanbul', country: 'Turkey', flag: '🇹🇷', lat: 41.0082, lng: 28.9784 },
  { name: 'lisbon', display: 'Lisbon', country: 'Portugal', flag: '🇵🇹', lat: 38.7223, lng: -9.1393 },
  { name: 'prague', display: 'Prague', country: 'Czech Republic', flag: '🇨🇿', lat: 50.0755, lng: 14.4378 },
  { name: 'vienna', display: 'Vienna', country: 'Austria', flag: '🇦🇹', lat: 48.2082, lng: 16.3738 },
  { name: 'seoul', display: 'Seoul', country: 'South Korea', flag: '🇰🇷', lat: 37.5665, lng: 126.978 },
  { name: 'mumbai', display: 'Mumbai', country: 'India', flag: '🇮🇳', lat: 19.076, lng: 72.8777 },
  { name: 'capetown', display: 'Cape Town', country: 'South Africa', flag: '🇿🇦', lat: -33.9249, lng: 18.4241 },
  { name: 'miami', display: 'Miami', country: 'USA', flag: '🇺🇸', lat: 25.7617, lng: -80.1918 },
];

interface WeatherTeaser {
  temp: number;
  weatherCode: number;
  isDay: number;
  humidity: number;
  windSpeed: number;
}

interface DestinationSearchProps {
  onCitySelect?: (city: City) => void;
}

export function DestinationSearch({ onCitySelect }: DestinationSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherTeaser | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 1
    ? POPULAR_CITIES.filter(c =>
        c.display.toLowerCase().startsWith(query.toLowerCase()) ||
        c.country.toLowerCase().startsWith(query.toLowerCase())
      ).slice(0, 6)
    : POPULAR_CITIES.slice(0, 6);

  const fetchWeatherForCity = useCallback(async (city: City) => {
    setLoadingWeather(true);
    setWeather(null);
    try {
      const res = await fetch(`/api/weather?lat=${city.lat}&lng=${city.lng}&days=1`);
      if (!res.ok) return;
      const data = await res.json();
      setWeather({
        temp: data.current.temperature,
        weatherCode: data.current.weatherCode,
        isDay: data.current.isDay,
        humidity: data.current.humidity,
        windSpeed: data.current.windSpeed,
      });
    } catch {
      // silently fail
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  const handleSelect = (city: City) => {
    setSelected(city);
    setQuery(city.display);
    setFocused(false);
    fetchWeatherForCity(city);
    onCitySelect?.(city);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const weatherInfo = weather ? getWeatherLabel(weather.weatherCode, weather.isDay) : null;

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      {/* Search bar */}
      <div className={`relative flex items-center rounded-2xl transition-all duration-300 ${
        focused
          ? 'ring-2 ring-primary/60 shadow-[0_0_40px_rgba(101,130,255,0.25)]'
          : 'shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
      } glass-dark`}>
        <div className="flex items-center pl-5 pr-3 py-4 flex-1 gap-3">
          <Search className="h-5 w-5 text-white/50 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Where do you want to go?"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); setWeather(null); }}
            onFocus={() => setFocused(true)}
            className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none font-medium"
          />
          {selected && (
            <AnimatePresence>
              {loadingWeather && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
                </motion.div>
              )}
              {!loadingWeather && weatherInfo && weather && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-sm text-white/90 font-medium"
                >
                  <span>{weatherInfo.emoji}</span>
                  <span>{weather.temp}°C</span>
                  <span className="text-white/50 text-xs hidden sm:inline">{weatherInfo.label}</span>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        <a
          href={selected ? `/login?destination=${encodeURIComponent(selected.display)}` : '/login'}
          className="mx-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all whitespace-nowrap"
        >
          Plan Trip
        </a>
      </div>

      {/* Dropdown suggestions */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 mt-2 rounded-2xl glass-dark overflow-hidden z-50 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                {query ? 'Destinations' : 'Popular destinations'}
              </div>
              {filtered.map((city, i) => (
                <motion.button
                  key={city.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleSelect(city)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left group"
                >
                  <span className="text-2xl">{city.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{city.display}</div>
                    <div className="text-white/45 text-xs">{city.country}</div>
                  </div>
                  <MapPin className="h-3.5 w-3.5 text-white/25 group-hover:text-white/50 flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather detail strip (shown after selection) */}
      <AnimatePresence>
        {!loadingWeather && weather && weatherInfo && selected && !focused && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 flex items-center gap-4 px-4 py-2.5 rounded-xl glass-dark text-sm text-white/70"
          >
            <span className="text-base">{selected.flag}</span>
            <span className="font-medium text-white/90">{selected.display} right now</span>
            <span className="text-white/40">·</span>
            <span>{weatherInfo.emoji} {weather.temp}°C, {weatherInfo.label}</span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{weather.humidity}%</span>
            <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{weather.windSpeed} km/h</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
