'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Share2, Calendar as CalendarIcon, Menu, Search, Bell, Settings, Home, Map, Wallet } from 'lucide-react';

export default function DesignPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground mt-2">Reference UI components and styling.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="rounded-full px-6">Primary</Button>
            <Button variant="secondary" className="rounded-full px-6">Secondary</Button>
            <Button variant="outline" className="rounded-full px-6">Outline</Button>
            <Button size="icon" className="rounded-full h-12 w-12"><Plus /></Button>
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><Share2 /></Button>
            <Button size="icon" variant="secondary" className="rounded-full h-12 w-12"><CalendarIcon /></Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Inputs</h2>
          <div className="flex flex-col gap-4">
            <Input placeholder="Search by destination..." className="rounded-2xl" />
            <Input placeholder="Add guests" className="rounded-2xl" />
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Tabs</h2>
          <Tabs defaultValue="one">
            <TabsList className="rounded-full border border-border/40 bg-card/60 backdrop-blur-xl p-1">
              <TabsTrigger value="one" className="rounded-full">Overview</TabsTrigger>
              <TabsTrigger value="two" className="rounded-full">Itinerary</TabsTrigger>
              <TabsTrigger value="three" className="rounded-full">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="rounded-full">Planning</Badge>
            <Badge variant="outline" className="rounded-full">Private</Badge>
            <Badge className="rounded-full">Active</Badge>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Icon Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><Plus /></Button>
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><Share2 /></Button>
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12"><CalendarIcon /></Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Progress</h2>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 w-1/2 rounded-full bg-primary" />
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Calendar (Compact)</h2>
          <div className="max-w-sm">
            <Calendar mode="single" />
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Button Groups</h2>
          <div className="flex rounded-full border border-border/40 overflow-hidden">
            <Button variant="secondary" className="rounded-none flex-1">Day</Button>
            <Button variant="ghost" className="rounded-none flex-1">Week</Button>
            <Button variant="ghost" className="rounded-none flex-1">Month</Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Toolbar</h2>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Plus /></Button>
            <Button variant="secondary" className="rounded-full px-4">Create</Button>
            <Button variant="outline" className="rounded-full px-4">Share</Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">App Bar</h2>
          <div className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl p-3 flex items-center justify-between">
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Menu /></Button>
            <div className="font-semibold">Dashboard</div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Search /></Button>
              <Button size="icon" variant="outline" className="rounded-full h-10 w-10"><Bell /></Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Navigation Bar</h2>
          <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-lg px-4 py-3 flex items-center justify-around">
            <div className="flex flex-col items-center text-[11px]"><Home className="h-5 w-5" />Home</div>
            <div className="flex flex-col items-center text-[11px]"><Map className="h-5 w-5" />Trips</div>
            <div className="flex flex-col items-center text-[11px]"><CalendarIcon className="h-5 w-5" />Calendar</div>
            <div className="flex flex-col items-center text-[11px]"><Wallet className="h-5 w-5" />Expenses</div>
            <div className="flex flex-col items-center text-[11px]"><Settings className="h-5 w-5" />Settings</div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">FAB</h2>
          <div className="flex items-center gap-3">
            <Button className="rounded-full h-14 px-6 shadow-lg" size="lg"><Plus className="mr-2" />Add</Button>
            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg"><Plus /></Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Loading</h2>
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </Card>
      </div>
    </div>
  );
}
