import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Map as MapIcon, Calendar, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 h-16 flex items-center border-b justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Globe className="h-6 w-6 text-primary" />
          <span>Travlogue</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:underline underline-offset-4">Features</Link>
          <Link href="#testimonials" className="hover:underline underline-offset-4">Testimonials</Link>
          <Link href="#pricing" className="hover:underline underline-offset-4">Pricing</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign up free</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-6">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Plan your next adventure together.
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Collaborate on itineraries, track expenses, and document your memories. The all-in-one travel logbook for modern explorers.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Start Planning <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/public">
                  <Button variant="outline" size="lg">
                    Explore Public Trips
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-xl border">
                {/* Placeholder for Hero Image */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Globe className="h-24 w-24 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900 px-6">
          <div className="container mx-auto space-y-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need for the perfect trip.</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  From initial brainstorming to post-trip memories, we've got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-1">
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-bold">Smart Itineraries</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag-and-drop planning with automatic timezone adjustments and transit calculations.
                </p>
              </div>
              <div className="grid gap-1">
                <Users className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-bold">Real-time Collaboration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Invite friends to edit the plan. Vote on activities and split expenses instantly.
                </p>
              </div>
              <div className="grid gap-1">
                <MapIcon className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-bold">Interactive Maps</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Visualize your route. Discover nearby attractions and hidden gems.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2026 Travlogue. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
