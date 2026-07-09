# Architecture

Pakere's demo is a small, dependency-light single-page app. There is no build
step and no framework — just three files in `src/`.

## Files

| File | Responsibility |
| --- | --- |
| `src/index.html` | Static markup for the shell (nav, hamburger drawer), the map "home" page, the driver/host dashboard containers, the Find-a-Spot bottom sheet, and the modal host. A tiny inline script in `<head>` applies the saved theme before first paint to avoid a flash. |
| `src/styles.css` | Design tokens (`:root` for light, `[data-theme="dark"]` for dark) followed by component styles. All colors, radii, and shadows are CSS variables. Includes the line-icon sizing rules (`.i`, `.istar`). |
| `src/app.js` | All behaviour. |

## `app.js` at a glance

The script is organized into labelled sections, top to bottom:

1. **Helpers & icons** — `money()`, `esc()`, and an `ICONS` map + `ic(name)`
   that returns inline stroke-SVG markup. Static markers in the HTML use
   `data-ic="..."` placeholders that are filled on boot.
2. **Data** — `AREAS` (Berkeley areas with coordinates, a public label, and a
   private `addr`/`access` revealed only after booking), plus `DRIVER` and
   `HOST` demo state. `total > 1` on a spot means a multi-space lot.
3. **Pricing engine** — `rateOf()` (applies gameday surge, capped at 2.5× the
   floor), `feeOf()` (`max(17%, $1.25)`), and `quote()` which returns the driver
   total and the host's 80% cut.
4. **Routing** — `goPage('map' | 'driver' | 'host')` toggles `.page.active` and
   lazily renders the relevant dashboard. The map is the default route.
5. **Drawer + theme** — hamburger open/close and the persisted dark-mode toggle.
6. **Surge, modal, and bottom sheet** — shared open/close plumbing.
7. **Find a Spot** — `renderRecs()` builds the ranked, filterable spot list.
8. **Leaflet map** — `loadMap()` lazily initializes the map, draws area bubbles,
   and wires the locate control. Guarded so it no-ops if Leaflet hasn't loaded.
9. **Spot panel** — the right-hand shelf of spots for a tapped area.
10. **Booking → session → checkout** — the full flow: `startBooking` →
    `goPay`/`confirmPay` → `showPass` (address unlock) → `beginSession` (an
    accelerated live timer) → `openExtend`/`doExtend` → `startLeaving` (GPS) →
    `photoStep`/`snap` → `finishSession` (receipt + rating).
11. **Dashboards** — `renderDriver()` and `renderHost()` build their views from
    the demo state each time they're shown.
12. **List a spot** — `startListing` → `pickKind` → `renderList` →
    `previewList` → `publishList`, which injects the new spot into both `AREAS`
    (so it appears on the map) and `HOST.listings`.
13. **Boot** — fills static icons and routes to the initial page.

## State model

All state lives in plain module-scoped objects (`AREAS`, `DRIVER`, `HOST`,
`booking`, `listing`, `SURGE`). There is no persistence except the theme
preference in `localStorage`. Reloading the page resets the demo.

## Testing

`scripts/smoke-test.mjs` loads the real `index.html` + `app.js` into
[jsdom](https://github.com/jsdom/jsdom), stubs the browser-only bits
(`IntersectionObserver`, Leaflet's `L`), and drives every flow via `window.eval`.
It asserts the pricing math, the booking lifecycle, availability accounting, the
listing publish loop, and that no emoji remain in the source. Run it with
`npm test`.
