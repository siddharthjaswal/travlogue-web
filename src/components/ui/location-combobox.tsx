'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface CountryData {
    name: string;
    isoCode: string;
    flag: string;
}

interface CountryComboboxProps {
    value: CountryData | null;
    onChange: (country: CountryData | null) => void;
    placeholder?: string;
    className?: string;
}

export function CountryCombobox({
    value,
    onChange,
    placeholder = 'Select country',
    className,
}: CountryComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && countries.length === 0) {
            setLoading(true);
            import('country-state-city').then(({ Country }) => {
                const all = Country.getAllCountries().map((c) => ({
                    name: c.name,
                    isoCode: c.isoCode,
                    flag: c.flag,
                }));
                setCountries(all);
                setLoading(false);
            });
        }
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const filtered = useMemo(() => {
        if (!search) return countries;
        const q = search.toLowerCase();
        return countries.filter((c) => c.name.toLowerCase().includes(q));
    }, [countries, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors',
                        'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <span className="flex min-w-0 items-center gap-2">
                        {value ? (
                            <>
                                <span className="text-base leading-none">{value.flag}</span>
                                <span className="truncate">{value.name}</span>
                            </>
                        ) : (
                            <span className="truncate">{placeholder}</span>
                        )}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Search country…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <ScrollArea className="max-h-60">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No country found.</p>
                    ) : (
                        <div className="p-1">
                            {filtered.map((country) => (
                                <button
                                    key={country.isoCode}
                                    type="button"
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                                        value?.isoCode === country.isoCode &&
                                            'bg-primary/10 font-medium text-primary'
                                    )}
                                    onClick={() => {
                                        onChange(value?.isoCode === country.isoCode ? null : country);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <span className="w-6 shrink-0 text-center text-base leading-none">
                                        {country.flag}
                                    </span>
                                    <span className="flex-1 text-left">{country.name}</span>
                                    {value?.isoCode === country.isoCode && (
                                        <Check className="h-4 w-4 shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

interface CityComboboxProps {
    value: string;
    onChange: (city: string) => void;
    countryCode: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function CityCombobox({
    value,
    onChange,
    countryCode,
    placeholder = 'Select city',
    disabled,
    className,
}: CityComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!countryCode) {
            setCities([]);
            return;
        }
        setLoading(true);
        import('country-state-city').then(({ City }) => {
            const all = City.getCitiesOfCountry(countryCode) ?? [];
            const names = [...new Set(all.map((c) => c.name))].sort();
            setCities(names);
            setLoading(false);
        });
    }, [countryCode]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const filtered = useMemo(() => {
        if (!search) return cities;
        const q = search.toLowerCase();
        return cities.filter((c) => c.toLowerCase().includes(q));
    }, [cities, search]);

    return (
        <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors',
                        'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        !value && 'text-muted-foreground',
                        disabled && 'cursor-not-allowed opacity-50',
                        className
                    )}
                >
                    <span className="truncate">
                        {value || (disabled ? 'Select country first' : placeholder)}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Search city…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <ScrollArea className="max-h-60">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No city found.</p>
                    ) : (
                        <div className="p-1">
                            {filtered.map((city) => (
                                <button
                                    key={city}
                                    type="button"
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                                        value === city && 'bg-primary/10 font-medium text-primary'
                                    )}
                                    onClick={() => {
                                        onChange(value === city ? '' : city);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <span className="flex-1 text-left">{city}</span>
                                    {value === city && <Check className="h-4 w-4 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
