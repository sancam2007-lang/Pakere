# Pakere

**Private parking, anywhere in Berkeley.** Pakere is a peer-to-peer parking marketplace that connects drivers who need a spot with hosts who have an unused driveway, garage, or lot. This repository is the **interactive front-end demo** — a map-first web app with fully clickable driver and host flows. No backend, no accounts, no real payments.

> Think Airbnb, but for parking spots.

---

## What's in the demo

The app opens directly on a live map of Berkeley. Everything below is wired up and clickable.

### For drivers
- **Map-first discovery** — real [Leaflet](https://leafletjs.com/) map with chat-bubble pins per area showing live availability.
- **Find a Spot** — a big bottom-sheet that lists recommended spots (ranked by distance once you share your location, otherwise by price) with driveway / garage / lot filters.
- **Booking → parking pass** — pick your duration, see a transparent price breakdown, and get an in-app pass. **The exact address stays private until you reserve.**
- **Live session lifecycle** — arrive, watch a live session timer and running cost, extend your time, then check out with a simulated GPS geofence + photo verification, an itemized receipt, and a star rating.
- **Driver dashboard** — trust score, trip history with receipts, active-session card, saved vehicles, and payment method.

### For hosts
- **List a spot** — a self-serve flow that branches into **Residential** (one driveway/garage) or **Urban Supply Partner** (a lot with bulk capacity, an auto-generated $1M insurance certificate, and entity/EIN details).
- **Host dashboard** — earnings overview + weekly chart, upcoming bookings with driver trust scores, per-listing live occupancy, pause/resume, and Stripe-Connect-style payouts.
- New listings publish straight to the map **and** the host dashboard — the full marketplace loop.

### Pricing engine
Implements the project's pricing rules:
- Service fee = `max(parking × 17%, $1.25)`
- Gameday **surge** is capped at **2.5× the host's floor** (toggle it on the map).
- Hosts always keep **80%** of the parking price.

### Design
- Cream / forest-green identity with a full **dark mode** (persisted to `localStorage`).
- [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) + [DM Sans](https://fonts.google.com/specimen/DM+Sans).
- A consistent set of hand-built stroke line-icons — **no emoji anywhere**.

---

## Run it

The app is plain HTML/CSS/JS — no build step. Any static file server works.

```bash
# with npm (installs a tiny static server)
npm install
npm start          # opens http://localhost:8080

# or with Python, no install
python3 -m http.server 8080 --directory src
```

Then open **http://localhost:8080**.

> **Note:** the map tiles (CARTO) and the Leaflet library load from a CDN, so the
> map needs an internet connection. Everything else works offline.

### Deploy on GitHub Pages
This repo is configured to publish the `src/` folder to GitHub Pages automatically
(see [`.github/workflows/pages.yml`](.github/workflows/pages.yml)). Enable Pages in
**Settings → Pages → Source: GitHub Actions** and push to `main`.

---

## Project structure

```
pakere/
├── src/
│   ├── index.html      # markup: nav, drawer, map home, dashboard shells, modals
│   ├── styles.css      # design tokens (light/dark) + all component styles
│   └── app.js          # state, pricing engine, routing, map, booking/session, dashboards
├── scripts/
│   └── smoke-test.mjs  # headless jsdom test covering every flow (npm test)
├── docs/
│   ├── ARCHITECTURE.md # how the code is organized
│   └── screenshots/    # add screenshots here for the README
├── .github/workflows/  # CI (test) + GitHub Pages deploy
├── package.json
├── LICENSE
└── README.md
```

## Develop & test

```bash
npm run lint    # syntax-check app.js
npm test        # run the headless smoke test (23 checks)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a tour of the code and
[`CONTRIBUTING.md`](CONTRIBUTING.md) for conventions.

---

## Status & disclaimer

This is a **product demo / prototype**, not a production service. There is no
server, authentication, or payment processing — checkout is clearly labelled
"demo mode." Areas, prices, hosts, and bookings are illustrative sample data.

## License

[MIT](LICENSE)
