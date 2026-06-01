'use client';

import { useEffect, useState } from 'react';
import { CloudSun, Wind, Droplets, Loader2, CalendarDays, Info } from 'lucide-react';
import { getWeatherLabel, type WeatherData } from '@/lib/weather';
import { guessCenter } from '@/lib/geo';
import { format, differenceInDays, isWithinInterval, parseISO } from 'date-fns';

interface WeatherPanelProps {
    city?: string | null;
    country?: string | null;
    tripStartTimestamp?: number | null;
    tripEndTimestamp?: number | null;
}

// Cache key uses city + date so it refreshes each calendar day
function getCacheKey(city: string, lat: number, lng: number) {
    const today = new Date().toISOString().split('T')[0];
    return `weather:${city}:${lat}:${lng}:${today}`;
}

export function WeatherPanel({ city, country, tripStartTimestamp, tripEndTimestamp }: WeatherPanelProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState('');

    const tripStart = tripStartTimestamp ? new Date(tripStartTimestamp * 1000) : null;
    const tripEnd = tripEndTimestamp ? new Date(tripEndTimestamp * 1000) : null;
    const daysUntilTrip = tripStart ? differenceInDays(tripStart, new Date()) : null;
    const isTripForecastAvailable = daysUntilTrip !== null && daysUntilTrip <= 15;

    useEffect(() => {
        if (!city && !country) { setLoading(false); return; }

        let cancelled = false;
        setLoading(true);

        const resolve = async () => {
            // Stage 1: fast hardcoded lookup
            let coords = guessCenter(city ?? undefined, country ?? undefined);

            // Stage 2: fall back to country-state-city (covers all 250 countries + 153K cities)
            if (!coords) {
                const { Country, City } = await import('country-state-city');

                // Find the country ISO code first
                let isoCode: string | null = null;
                if (country) {
                    const match = Country.getAllCountries().find(
                        (c) => c.name.toLowerCase() === country.toLowerCase()
                    );
                    if (match) {
                        isoCode = match.isoCode;
                        // Use country centre as baseline
                        const cLat = parseFloat(match.latitude);
                        const cLng = parseFloat(match.longitude);
                        if (!isNaN(cLat) && !isNaN(cLng)) coords = { lat: cLat, lng: cLng };
                    }
                }

                // Refine to city if we have one
                if (city && isoCode) {
                    const cities = City.getCitiesOfCountry(isoCode) ?? [];
                    // Accent-insensitive comparison so "Reykjavik" matches "Reykjavík" etc.
                    const normalize = (s: string) =>
                        s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
                    const cityNorm = normalize(city);
                    const match = cities.find((c) => normalize(c.name) === cityNorm);
                    if (match?.latitude && match?.longitude) {
                        const cLat = parseFloat(match.latitude);
                        const cLng = parseFloat(match.longitude);
                        if (!isNaN(cLat) && !isNaN(cLng)) coords = { lat: cLat, lng: cLng };
                    }
                }
            }

            if (!coords || cancelled) { setLoading(false); return; }

            const name = city || country || '';
            if (!cancelled) setLocationName(name);

            // Session cache keyed by city + coords + date
            const cacheKey = getCacheKey(name, coords.lat, coords.lng);
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                try {
                    if (!cancelled) { setWeather(JSON.parse(cached)); setLoading(false); }
                    return;
                } catch {}
            }

            // Fetch 16 days — max Open-Meteo forecast window
            fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}&days=16`)
                .then((r) => r.json())
                .then((data) => {
                    sessionStorage.setItem(cacheKey, JSON.stringify(data));
                    if (!cancelled) setWeather(data);
                })
                .catch(() => {})
                .finally(() => { if (!cancelled) setLoading(false); });
        };

        resolve();
        return () => { cancelled = true; };
    }, [city, country]);

    if (!city && !country) return null;

    const current = weather?.current;
    const currentInfo = current ? getWeatherLabel(current.weatherCode, current.isDay) : null;

    // Get only the forecast days that fall within trip dates
    const tripForecastDays = (weather?.forecast || []).filter(day => {
        if (!tripStart || !tripEnd) return false;
        const d = parseISO(day.date);
        return isWithinInterval(d, { start: tripStart, end: tripEnd });
    });

    return (
        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-400/10 flex items-center justify-center">
                    <CloudSun className="h-4 w-4 text-teal-400" />
                </div>
                <span className="text-sm font-semibold text-foreground">Weather</span>
                {locationName && (
                    <span className="ml-auto text-xs text-muted-foreground">{locationName}</span>
                )}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                </div>
            )}

            {!loading && !weather && (
                <div className="text-xs text-muted-foreground text-center py-4">Weather data unavailable</div>
            )}

            {!loading && weather && current && currentInfo && (
                <>
                    {/* Current conditions */}
                    <div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Now</div>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl">{currentInfo.emoji}</span>
                            <div>
                                <div className="text-3xl font-bold text-foreground leading-none">{current.temperature}°C</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{currentInfo.label}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Droplets className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                {current.humidity}% humidity
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Wind className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                                {current.windSpeed} km/h
                            </div>
                        </div>
                    </div>

                    {/* Trip-date forecast (if within 16 days) */}
                    {tripStart && tripForecastDays.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-border/30">
                            <div className="flex items-center gap-1.5 mb-2">
                                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                                    Trip forecast · {format(tripStart, 'MMM d')}
                                    {tripEnd && tripEnd.getTime() !== tripStart.getTime() ? ` – ${format(tripEnd, 'MMM d')}` : ''}
                                </span>
                            </div>
                            {tripForecastDays.map((day, i) => {
                                const info = getWeatherLabel(day.weatherCode, 1);
                                const d = parseISO(day.date);
                                const label = format(d, 'EEE d');
                                const pct = Math.min(100, Math.round(day.precipitationSum * 10));
                                return (
                                    <div key={i} className="flex items-center gap-2 text-xs bg-primary/5 rounded-lg px-2 py-1">
                                        <span className="w-12 text-foreground font-medium">{label}</span>
                                        <span className="text-base leading-none">{info.emoji}</span>
                                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                            {pct > 0 && <div className="h-full rounded-full bg-blue-400/60" style={{ width: `${pct}%` }} />}
                                        </div>
                                        <span className="w-8 text-right font-semibold text-foreground">{day.maxTemp}°</span>
                                        <span className="w-6 text-right text-muted-foreground">{day.minTemp}°</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* If trip is too far out for forecast */}
                    {tripStart && !isTripForecastAvailable && tripForecastDays.length === 0 && (
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30 mt-2">
                            <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-muted-foreground">
                                Trip forecast for {format(tripStart, 'MMM d')} available{' '}
                                <span className="text-foreground font-medium">
                                    in {(daysUntilTrip! - 15)} days
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 7-day general forecast (when not showing trip-specific) */}
                    {(tripForecastDays.length === 0) && weather.forecast.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-border/30">
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">7-day forecast</div>
                            {weather.forecast.slice(0, 7).map((day, i) => {
                                const info = getWeatherLabel(day.weatherCode, 1);
                                const date = parseISO(day.date);
                                const label = i === 0 ? 'Today' : format(date, 'EEE');
                                const pct = Math.min(100, Math.round(day.precipitationSum * 10));
                                return (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <span className="w-10 text-muted-foreground">{label}</span>
                                        <span className="text-base leading-none">{info.emoji}</span>
                                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                            {pct > 0 && <div className="h-full rounded-full bg-blue-400/60" style={{ width: `${pct}%` }} />}
                                        </div>
                                        <span className="w-8 text-right font-medium text-foreground">{day.maxTemp}°</span>
                                        <span className="w-6 text-right text-muted-foreground">{day.minTemp}°</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
