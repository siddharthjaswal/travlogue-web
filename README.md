# Travlogue Web

The web frontend for **Travlogue**, a travel-planning app — plan trips, build day-by-day itineraries, track budgets and expenses, check weather, search flights, and collaborate with fellow travellers.

Built with **Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Radix / shadcn · TanStack Query · Framer Motion · Google Maps & Leaflet**. Dark-first design system.

It pairs with the [Logbook](https://github.com/siddharthjaswal/logbook) backend API.

## Getting Started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` to `.env.local` and provide the required values (API base URL, Google Maps key, etc.). The app expects the Logbook backend running (default `http://localhost:8000`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | End-to-end tests (Playwright — needs both servers running) |

## Project Structure

- `src/app` — Next.js App Router routes
- `src/components` — UI components (timeline, budget, maps, settings, …)
- `src/services` — API client layer
- `src/hooks` — TanStack Query hooks
- `src/lib` — utilities (formatting, geo, maps deep-links, …)
- `/design` — living style guide

## License

Licensed under the [Apache License, Version 2.0](./LICENSE). You may use, modify, and distribute this software (including commercially) under the terms of that license. See [NOTICE](./NOTICE) for attribution.

Travlogue is open source. The hosted commercial version (with additional features such as real-time collaboration and AI assistance) is maintained separately.
