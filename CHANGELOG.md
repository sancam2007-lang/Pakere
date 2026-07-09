# Changelog

All notable changes to this project are documented here.

## [0.1.0] — 2026-07-09

Initial public demo.

### Added
- Map-first home screen (Leaflet + CARTO tiles) with per-area availability bubbles.
- "Find a Spot" bottom sheet with distance/price ranking and driveway/garage/lot filters.
- Driver flow: booking, transparent price breakdown, in-app parking pass with
  address-unlock-on-reserve, live session timer, time extensions, simulated GPS +
  photo checkout, itemized receipt, and star rating.
- Driver dashboard: trust score, trip history, active session, vehicles, payment.
- Host flow: self-serve "List a spot" for Residential and Urban Supply Partner
  (bulk capacity, $1M insurance certificate, entity/EIN), publishing to the map.
- Host dashboard: earnings overview + weekly chart, upcoming bookings, per-listing
  occupancy, pause/resume, and payouts.
- Pricing engine: `max(17%, $1.25)` service fee, 2.5× gameday surge cap, 80% host split.
- Full dark mode (persisted) and a consistent stroke line-icon set (no emoji).
- Headless jsdom smoke test and CI.
