// Shared formatting helpers for currency and units.

export type UnitSystem = 'metric' | 'imperial';

export interface CurrencyOption {
    code: string;
    symbol: string;
    name: string;
}

// Common travel currencies (extend as needed).
export const CURRENCIES: CurrencyOption[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

const SYMBOLS: Record<string, string> = Object.fromEntries(
    CURRENCIES.map((c) => [c.code, c.symbol])
);

/** Currency symbol for an ISO code (falls back to the code itself). */
export function currencySymbol(code?: string | null): string {
    if (!code) return '$';
    return SYMBOLS[code.toUpperCase()] ?? code.toUpperCase();
}

/** Format an amount with the right currency symbol. */
export function formatMoney(amount: number, code?: string | null): string {
    const sym = currencySymbol(code);
    const value = amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return `${sym}${value}`;
}

/** Convert a Celsius value to the user's unit system and format it. */
export function formatTemp(celsius: number, unit: UnitSystem = 'metric'): string {
    if (unit === 'imperial') {
        return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
}

/** Convert km/h wind speed to the user's unit system and format it. */
export function formatSpeed(kmh: number, unit: UnitSystem = 'metric'): string {
    if (unit === 'imperial') {
        return `${Math.round(kmh * 0.621371)} mph`;
    }
    return `${Math.round(kmh)} km/h`;
}

/** Format a distance in meters to the user's unit system. */
export function formatDistance(meters: number, unit: UnitSystem = 'metric'): string {
    if (unit === 'imperial') {
        const mi = meters / 1609.344;
        return mi < 0.2 ? `${Math.round(meters * 3.28084)} ft` : `${mi.toFixed(1)} mi`;
    }
    return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

/** Format a duration in seconds as "21 min" / "1h 5m". */
export function formatDuration(seconds: number): string {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
}
