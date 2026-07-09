# Contributing

Thanks for your interest in Pakere. This is a small, no-build prototype, so
contributing is intentionally lightweight.

## Getting started

```bash
npm install
npm start     # http://localhost:8080
```

Edit the files in `src/` and refresh the browser. There is no bundler or
transpile step.

## Before you open a PR

```bash
npm run lint   # syntax-check app.js
npm test       # headless smoke test — must stay green
```

If you add or change a flow, extend `scripts/smoke-test.mjs` to cover it.

## Conventions

- **No build tooling and no frameworks.** Keep it vanilla HTML/CSS/JS.
- **Theme with variables.** Never hard-code a color — add or reuse a CSS
  variable in `:root` and its `[data-theme="dark"]` counterpart.
- **No emoji.** Use the stroke line-icons via `ic('name')` (or a `data-ic`
  placeholder in static HTML). Add new glyphs to the `ICONS` map in `app.js`.
- **Keep sections labelled.** `app.js` is organized by the banner comments
  described in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); add new code to
  the matching section.
- Demo data lives in the `AREAS`, `DRIVER`, and `HOST` objects. Keep it
  clearly illustrative.

## Scope

This repo is a front-end demo. Please don't add a real backend, auth, or
payment integration here — those belong in a separate service.
