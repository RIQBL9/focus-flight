# ✈️ FocusFlight

An aviation-themed study app with lofi jazz, interactive boarding, animated flight progress, and a focus timer. Built to make studying feel like settling into a long-haul flight to somewhere good.

## Features

### 🎫 Boarding Flow (3 steps with progress save)
- **9 routes** including Manchester, London, Istanbul, Jeddah, Agadir, JFK, Dubai, Singapore, Paris, Tokyo, Sydney, LA, Doha
- Searchable flight list (by city, airport code, or route)
- Editable passenger name with avatar
- Interactive seat map: First, Business, Economy, plus Extra Legroom seats
- Filter seats by window, aisle, or extra legroom
- Hover preview + selection details
- Animated boarding pass with barcode, QR code, and "scan to board" effect

### 🛩️ Flight Deck
- Live animated gauges (altitude, speed, vertical speed, heading, fuel)
- Phase indicator (Pre-departure → Climbing → Ascending → Cruising)
- 8 toggleable cockpit switches (autopilot, seatbelt, beacon, strobe, etc.)
- ATC chatter feed with rolling messages
- Navigation display with range rings and waypoints

### 📚 Study Mode
- **Live flight progress map** — animated arc with the plane traveling between your two airports
- 4 timer presets named like flight types (Short Hop 15m → Ultra Long 90m)
- Persistent session counter + total hours studied
- Soft chime when the timer ends
- Task log with priority levels, persistence, and clear-done
- Live altitude / speed / distance covered / distance remaining stats

### 🎷 Lofi Jazz Player
- 5 procedurally generated tracks (no audio files — uses Web Audio API)
- Vinyl crackle, jazz chord progressions, swing hi-hats
- Expandable player with track list and volume control
- Volume persists across reloads

### 💾 Persistence
Everything saves: passenger name, selected flight, seat, current view, timer preset, completed sessions, total study minutes, tasks, and music volume.

## Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → "Add New" → "Project"
3. Import your repo — Vercel auto-detects Vite
4. Click "Deploy"

Or via CLI:
```bash
npm i -g vercel
vercel
```

## Tech Stack

- React 18 + Vite
- Web Audio API (lofi engine, no external audio files)
- localStorage for persistence
- Pure CSS animations
- Zero external UI dependencies
