'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Share2, Calendar as CalendarIcon, Menu, Search, Bell, Settings, Home, Map, Wallet } from 'lucide-react';
import Image from 'next/image';

export default function DesignPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-10 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(76,120,220,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(80,200,180,0.10),transparent_60%)]" />
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground mt-2">Reference UI components and styling.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Typography</h2>
          <div className="space-y-2">
            <div className="text-5xl font-bold tracking-tight">Travlogue</div>
            <div className="text-3xl font-semibold tracking-tight">Plan. Travel. Remember.</div>
            <div className="text-xl text-muted-foreground">A calm, expressive system for travel planning.</div>
            <div className="text-sm text-muted-foreground">Body / regular — The quick brown fox jumps over the lazy dog.</div>
          </div>
        </Card>

        <Card className="md:col-span-2 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Branding</h2>
          <div className="grid gap-4 md:grid-cols-3 items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Image src="/ic_travlogue.svg" alt="Travlogue logo" width={26} height={26} />
              </div>
              <div className="text-xl font-semibold">Travlogue</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Image src="/ic_travlogue.svg" alt="Travlogue icon" width={24} height={24} />
              </div>
              <div className="text-base font-medium text-muted-foreground">Icon only</div>
            </div>
            <div className="text-xl font-semibold">Travlogue</div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-border/40 bg-background p-4 flex items-center gap-2">
              <Image src="/favicon.svg" alt="Web tab" width={20} height={20} />
              <span className="text-sm">Web tab icon</span>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background p-4 flex items-center gap-2">
              <Image src="/icons/icon-192.png" alt="PWA icon" width={24} height={24} />
              <span className="text-sm">PWA icon</span>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background p-4 flex items-center gap-2">
              <Image src="/icons/apple-touch-icon.png" alt="Apple icon" width={24} height={24} />
              <span className="text-sm">Apple touch</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Color Scheme</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Primary', className: 'bg-primary text-primary-foreground' },
              { label: 'Secondary', className: 'bg-secondary text-secondary-foreground' },
              { label: 'Accent', className: 'bg-accent text-accent-foreground' },
              { label: 'Destructive', className: 'bg-destructive text-destructive-foreground' },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl p-4 ${c.className}`}>
                <div className="text-sm font-semibold">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Background', className: 'bg-background text-foreground border border-border/40' },
              { label: 'Card', className: 'bg-card text-card-foreground border border-border/40' },
              { label: 'Muted', className: 'bg-muted text-muted-foreground border border-border/40' },
              { label: 'Border', className: 'bg-border text-foreground' },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl p-4 ${c.className}`}>
                <div className="text-sm font-semibold">{c.label}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="rounded-full px-6">Primary</Button>
            <Button variant="secondary" className="rounded-full px-6">Secondary</Button>
            <Button variant="outline" className="rounded-full px-6">Outline</Button>
            <Button size="icon" className="rounded-full h-12 w-12"><Plus /></Button>
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><Share2 /></Button>
            <Button size="icon" variant="secondary" className="rounded-full h-12 w-12"><CalendarIcon /></Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Inputs</h2>
          <div className="flex flex-col gap-4">
            <Input placeholder="Search by destination..." className="rounded-2xl" />
            <Input placeholder="Add guests" className="rounded-2xl" />
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Tabs</h2>
          <Tabs defaultValue="one">
            <TabsList className="rounded-full border border-border/40 bg-card/60 backdrop-blur-xl p-1">
              <TabsTrigger value="one" className="rounded-full">Overview</TabsTrigger>
              <TabsTrigger value="two" className="rounded-full">Itinerary</TabsTrigger>
              <TabsTrigger value="three" className="rounded-full">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="rounded-full">Planning</Badge>
            <Badge variant="outline" className="rounded-full">Private</Badge>
            <Badge className="rounded-full">Active</Badge>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Icon Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><Plus /></Button>
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><Share2 /></Button>
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><CalendarIcon /></Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 w-1/2 rounded-full bg-primary" />
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Calendar (Compact)</h2>
          <div className="max-w-sm">
            <Calendar mode="single" />
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Calendar (Range)</h2>
          <div className="max-w-sm">
            <Calendar mode="range" selected={{ from: new Date(2026, 1, 7), to: new Date(2026, 1, 14) }} />
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Button Groups</h2>
          <div className="flex rounded-full border border-border/40 overflow-hidden">
            <Button variant="secondary" className="rounded-none flex-1">Day</Button>
            <Button variant="ghost" className="rounded-none flex-1">Week</Button>
            <Button variant="ghost" className="rounded-none flex-1">Month</Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Toolbar</h2>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Plus /></Button>
            <Button variant="secondary" className="rounded-full px-4">Create</Button>
            <Button variant="outline" className="rounded-full px-4">Share</Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">App Bar</h2>
          <div className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl p-3 flex items-center justify-between">
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Menu /></Button>
            <div className="font-semibold">Dashboard</div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Search /></Button>
              <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Bell /></Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Navigation Bar</h2>
          <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-lg px-4 py-3 flex items-center justify-around">
            <div className="flex flex-col items-center text-[11px]"><Home className="h-5 w-5" />Home</div>
            <div className="flex flex-col items-center text-[11px]"><Map className="h-5 w-5" />Trips</div>
            <div className="flex flex-col items-center text-[11px]"><CalendarIcon className="h-5 w-5" />Calendar</div>
            <div className="flex flex-col items-center text-[11px]"><Wallet className="h-5 w-5" />Expenses</div>
            <div className="flex flex-col items-center text-[11px]"><Settings className="h-5 w-5" />Settings</div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">FAB</h2>
          <div className="flex items-center gap-3">
            <Button className="rounded-full h-14 px-6 shadow-lg" size="lg"><Plus className="mr-2" />Add</Button>
            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg"><Plus /></Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 pt-7 pb-7 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Loading</h2>
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </Card>
      </div>
    </div>
  );
}
