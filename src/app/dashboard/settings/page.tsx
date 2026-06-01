'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Thermometer, Coins, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/auth-service';
import { CURRENCIES, type UnitSystem } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const UNIT_OPTIONS: { value: UnitSystem; label: string; hint: string }[] = [
    { value: 'metric', label: 'Metric', hint: '°C · km' },
    { value: 'imperial', label: 'Imperial', hint: '°F · mi' },
];

export default function SettingsPage() {
    const { user, isLoading, setUser } = useAuth();

    const [currency, setCurrency] = useState('USD');
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
    const [saving, setSaving] = useState(false);

    // Hydrate form from the loaded user.
    useEffect(() => {
        if (user) {
            setCurrency(user.defaultCurrency || 'USD');
            setUnitSystem(user.unitSystem || 'metric');
        }
    }, [user]);

    const dirty =
        !!user && (currency !== user.defaultCurrency || unitSystem !== user.unitSystem);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await authService.updatePreferences({
                defaultCurrency: currency,
                unitSystem,
            });
            setUser(updated);
            toast.success('Preferences saved');
        } catch {
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground mt-2">Personalize your Travlogue experience.</p>

            <div className="mt-8 space-y-6">
                {/* Currency */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                                <Coins className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Currency</CardTitle>
                                <CardDescription>Default currency for budgets and expenses.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
                        ) : (
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="w-full max-w-xs rounded-xl">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {CURRENCIES.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            <span className="inline-flex items-center gap-2">
                                                <span className="w-7 text-muted-foreground">{c.symbol}</span>
                                                <span>{c.code}</span>
                                                <span className="text-muted-foreground">· {c.name}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </CardContent>
                </Card>

                {/* Units */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                                <Thermometer className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Units</CardTitle>
                                <CardDescription>Measurement system for temperature and distance.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-12 w-64 rounded-xl" />
                        ) : (
                            <div className="grid grid-cols-2 gap-3 max-w-sm">
                                {UNIT_OPTIONS.map((opt) => {
                                    const active = unitSystem === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setUnitSystem(opt.value)}
                                            aria-pressed={active}
                                            className={cn(
                                                'flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-all',
                                                active
                                                    ? 'border-primary/50 bg-primary/10'
                                                    : 'border-border/50 hover:border-border hover:bg-muted/40'
                                            )}
                                        >
                                            <span className="flex w-full items-center justify-between text-sm font-medium">
                                                {opt.label}
                                                {active && <Check className="h-4 w-4 text-primary" />}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{opt.hint}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Save */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={!dirty || saving} className="gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
