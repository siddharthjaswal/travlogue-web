'use client';

/**
 * Travlogue Design Language — living style guide.
 *
 * This route is the single source of truth for the visual system: colors,
 * surfaces & elevation, typography, components, map styling, and patterns.
 * Reference it (and keep it updated) when building new UI.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Plus, Search, MapPin, Camera, Utensils, Plane, Hotel, Mountain,
    Wallet, Globe, CalendarDays, TrendingUp,
} from 'lucide-react';

// ── Reusable section wrapper ───────────────────────────────────────────────
function Section({ id, title, subtitle, children }: {
    id: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-8 space-y-5">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}

function Swatch({ label, sub, className, style }: {
    label: string; sub?: string; className?: string; style?: React.CSSProperties;
}) {
    return (
        <div className="space-y-1.5">
            <div className={`h-16 rounded-xl border border-border/60 ${className ?? ''}`} style={style} />
            <div className="px-0.5">
                <div className="text-xs font-medium text-foreground">{label}</div>
                {sub && <div className="text-[11px] text-muted-foreground font-mono">{sub}</div>}
            </div>
        </div>
    );
}

const SEMANTIC = [
    { label: 'background', sub: 'base canvas', cls: 'bg-background' },
    { label: 'card', sub: 'surface-1', cls: 'bg-card' },
    { label: 'popover', sub: 'surface-2/3', cls: 'bg-popover' },
    { label: 'muted', sub: 'subtle fill', cls: 'bg-muted' },
    { label: 'secondary', sub: 'secondary fill', cls: 'bg-secondary' },
    { label: 'border', sub: 'edges', cls: 'bg-border' },
    { label: 'primary', sub: 'brand / actions', cls: 'bg-primary' },
    { label: 'accent', sub: 'coral highlight', cls: 'bg-accent' },
    { label: 'destructive', sub: 'errors', cls: 'bg-destructive' },
];

const TRAVEL_ACCENTS = [
    { label: 'Primary (blue)', sub: 'oklch(0.65 0.18 255)', style: { background: 'oklch(0.65 0.18 255)' } },
    { label: 'Teal', sub: '#7FD1C8', style: { background: '#7FD1C8' } },
    { label: 'Coral', sub: '#F2A477', style: { background: '#F2A477' } },
    { label: 'Gold', sub: 'oklch(0.82 0.15 85)', style: { background: 'oklch(0.82 0.15 85)' } },
    { label: 'Violet', sub: '#A8A4F2', style: { background: '#A8A4F2' } },
    { label: 'Sand', sub: '#C5B8A5', style: { background: '#C5B8A5' } },
];

// Activity/marker type → color (mirrors styled-map + activity chips)
const MARKERS = [
    { type: 'Sightseeing', color: '#7FD1C8', icon: Camera },
    { type: 'Dining', color: '#F2A477', icon: Utensils },
    { type: 'Transport', color: '#A8A4F2', icon: Plane },
    { type: 'Stay', color: '#8FB7FF', icon: Hotel },
    { type: 'Adventure', color: '#9DD49A', icon: Mountain },
    { type: 'Default', color: '#9BB6D4', icon: MapPin },
];

const TYPE_SCALE = [
    { cls: 'text-4xl font-bold tracking-tight', name: 'Display / 4xl bold', sample: 'Plan your journey' },
    { cls: 'text-2xl font-semibold tracking-tight', name: 'Heading / 2xl semibold', sample: 'Icelandic Roadtrip' },
    { cls: 'text-lg font-semibold', name: 'Subheading / lg', sample: 'Trip Budget' },
    { cls: 'text-sm', name: 'Body / sm', sample: 'A romantic 3-night escape to the City of Light.' },
    { cls: 'text-xs text-muted-foreground', name: 'Caption / xs muted', sample: 'Jun 17 – Jun 24, 2026' },
    { cls: 'text-[10px] font-semibold uppercase tracking-widest text-muted-foreground', name: 'Overline', sample: 'Upcoming' },
];

export default function DesignPage() {
    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 pb-24">
            {/* Header */}
            <header className="space-y-2">
                <Badge variant="secondary" className="rounded-full">Living reference</Badge>
                <h1 className="text-4xl font-bold tracking-tight gradient-text-travel">Travlogue Design Language</h1>
                <p className="text-muted-foreground max-w-2xl">
                    The visual system for a calm, premium travel-planning experience. Dark-first,
                    layered surfaces, expressive travel accents. Keep this page in sync as the UI evolves.
                </p>
            </header>

            {/* Surfaces & Elevation — the core */}
            <Section
                id="surfaces"
                title="Surfaces & Elevation"
                subtitle="The backbone of the system. Each level steps lighter with a defined border + deeper shadow, so content separates clearly from the dark canvas."
            >
                <div className="rounded-2xl bg-background border border-border/60 p-6 space-y-4">
                    <p className="text-xs text-muted-foreground">Base canvas (bg-background) — the page sits here</p>
                    <div className="surface-1 rounded-2xl p-5">
                        <p className="text-sm font-medium">Surface-1 · <span className="font-mono text-xs text-muted-foreground">.surface-1</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Content cards: stats, panels, list rows, inputs.</p>
                        <div className="surface-2 rounded-xl p-4 mt-4">
                            <p className="text-sm font-medium">Surface-2 · <span className="font-mono text-xs text-muted-foreground">.surface-2</span></p>
                            <p className="text-xs text-muted-foreground mt-1">Raised tiles, hover state, nested cards.</p>
                            <div className="surface-3 rounded-lg p-4 mt-4">
                                <p className="text-sm font-medium">Surface-3 · <span className="font-mono text-xs text-muted-foreground">.surface-3</span></p>
                                <p className="text-xs text-muted-foreground mt-1">Overlays: dialogs, popovers, menus.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="surface-1 rounded-xl p-4 text-sm">.surface-1 — flat card</div>
                    <div className="surface-2 rounded-xl p-4 text-sm">.surface-2 — raised</div>
                    <div className="surface-interactive rounded-xl p-4 text-sm">.surface-interactive — hover me</div>
                </div>
            </Section>

            {/* Color */}
            <Section id="color" title="Color — semantic tokens" subtitle="Reference via CSS variables / Tailwind classes. Never hardcode hex for these.">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {SEMANTIC.map((c) => (
                        <Swatch key={c.label} label={c.label} sub={c.sub} className={c.cls} />
                    ))}
                </div>
            </Section>

            <Section id="accents" title="Travel accent palette" subtitle="Expressive accents for categories, charts, and highlights. Used at low opacity for icon chips.">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {TRAVEL_ACCENTS.map((c) => (
                        <Swatch key={c.label} label={c.label} sub={c.sub} style={c.style} />
                    ))}
                </div>
            </Section>

            {/* Typography */}
            <Section id="type" title="Typography" subtitle="Geist Sans. Tight tracking on headings; muted-foreground for secondary text.">
                <Card>
                    <CardContent className="space-y-5 pt-2">
                        {TYPE_SCALE.map((t) => (
                            <div key={t.name} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                                <span className="w-44 shrink-0 text-[11px] font-mono text-muted-foreground">{t.name}</span>
                                <span className={t.cls}>{t.sample}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </Section>

            {/* Radius */}
            <Section id="radius" title="Radius" subtitle="Generous, soft corners. Base --radius = 1rem.">
                <div className="flex flex-wrap gap-4">
                    {[
                        { name: 'lg (default card)', cls: 'rounded-3xl' },
                        { name: '2xl (panels)', cls: 'rounded-2xl' },
                        { name: 'xl (inputs, chips)', cls: 'rounded-xl' },
                        { name: 'full (pills)', cls: 'rounded-full' },
                    ].map((r) => (
                        <div key={r.name} className="space-y-1.5">
                            <div className={`h-16 w-24 surface-1 ${r.cls}`} />
                            <div className="text-[11px] text-muted-foreground">{r.name}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Buttons */}
            <Section id="buttons" title="Buttons">
                <div className="flex flex-wrap items-center gap-3">
                    <Button><Plus className="h-4 w-4" /> Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg"><Plus className="h-5 w-5" /> Large</Button>
                </div>
            </Section>

            {/* Inputs */}
            <Section id="inputs" title="Inputs & search">
                <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="Search your trips…"
                            className="surface-1 w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <input
                        placeholder="Plain input"
                        className="surface-1 w-full h-11 px-4 rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </Section>

            {/* Badges */}
            <Section id="badges" title="Badges & pills">
                <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <span className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/60 text-xs text-muted-foreground">place pill</span>
                </div>
            </Section>

            {/* Cards */}
            <Section id="cards" title="Card types">
                <div className="grid sm:grid-cols-2 gap-5">
                    {/* Content card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Content card</CardTitle>
                            <CardDescription>Default <span className="font-mono text-xs">.surface-1</span> on flat backgrounds.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Budget, settings, panels.</CardContent>
                    </Card>

                    {/* Stat tile */}
                    <div className="surface-interactive flex items-center gap-3.5 rounded-2xl px-4 py-3.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-primary" strokeWidth={1.75} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary leading-none tracking-tight">5</div>
                            <div className="text-xs text-muted-foreground mt-1">Stat tile</div>
                        </div>
                    </div>

                    {/* Liquid glass */}
                    <div className="liquid-glass rounded-3xl p-5">
                        <p className="text-sm font-medium">Liquid glass · <span className="font-mono text-xs text-muted-foreground">.liquid-glass</span></p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Frosted, translucent panel with a specular top edge + diagonal sheen.
                            Used for the itinerary calendar. Reads as glass even on flat dark bg.
                        </p>
                    </div>

                    {/* Glass card over imagery */}
                    <div className="relative h-32 rounded-2xl overflow-hidden border border-border/40">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200')] bg-cover bg-center" />
                        <div className="absolute inset-x-0 bottom-0 glass-dark p-4">
                            <p className="text-[10px] uppercase tracking-widest text-white/70">Glass over imagery</p>
                            <p className="text-white font-semibold">.glass-dark — covers & hero overlays</p>
                        </div>
                    </div>
                </div>

                <div className="surface-1 rounded-2xl p-4 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Date range:</span> solid accent
                    endpoints (caps) + translucent <span className="font-mono">bg-primary/15</span> track
                    between — never two solid shades. Today = accent number, not a filled circle.
                </div>
            </Section>

            {/* Map styling */}
            <Section id="maps" title="Maps" subtitle="Dark, decluttered Google Maps style (geometry only, city labels dimmed). Markers are color-coded by activity type.">
                <div className="grid sm:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-border/60 p-4 space-y-3" style={{ background: '#0d1117' }}>
                        <p className="text-xs text-muted-foreground">Map canvas — <span className="font-mono">#0d1117</span> geometry, <span className="font-mono">#0a1628</span> water</p>
                        <div className="flex gap-2">
                            <span className="h-3 w-10 rounded" style={{ background: '#171d29' }} title="road" />
                            <span className="h-3 w-10 rounded" style={{ background: '#0a1628' }} title="water" />
                            <span className="h-3 w-10 rounded" style={{ background: '#0f1e14' }} title="park" />
                        </div>
                    </div>
                    <div className="surface-1 rounded-2xl p-4">
                        <p className="text-xs text-muted-foreground mb-3">Marker legend</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {MARKERS.map((m) => (
                                <div key={m.type} className="flex items-center gap-2 text-xs">
                                    <span className="h-3.5 w-3.5 rounded-full border-2" style={{ background: m.color, borderColor: '#0d1117' }} />
                                    <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                    {m.type}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Iconography */}
            <Section id="icons" title="Iconography" subtitle="lucide-react, stroke 1.5–1.75. Place accent icons in a tinted rounded chip.">
                <div className="flex flex-wrap gap-3">
                    {[
                        { icon: Globe, c: 'text-violet-400', b: 'bg-violet-400/10' },
                        { icon: CalendarDays, c: 'text-teal-400', b: 'bg-teal-400/10' },
                        { icon: TrendingUp, c: 'text-orange-400', b: 'bg-orange-400/10' },
                        { icon: MapPin, c: 'text-primary', b: 'bg-primary/10' },
                    ].map((it, i) => (
                        <div key={i} className={`w-11 h-11 rounded-xl ${it.b} flex items-center justify-center`}>
                            <it.icon className={`h-5 w-5 ${it.c}`} strokeWidth={1.75} />
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}
