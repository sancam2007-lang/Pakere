/**
 * Headless smoke test for the Pakere demo.
 *
 * Loads src/index.html + src/app.js in jsdom (Leaflet is stubbed out, since the
 * map only needs a live browser + network), then drives every core flow:
 * routing, the pricing engine, booking -> pass -> session -> checkout, and the
 * driver/host dashboards + listing flows.
 *
 * Run with:  npm test
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let html = readFileSync(join(root, "src/index.html"), "utf8");
const appjs = readFileSync(join(root, "src/app.js"), "utf8");

// Inline app.js so jsdom runs it (external defer scripts are not fetched here),
// and drop the external Leaflet tag (L stays undefined and is guarded in code).
// Function replacers avoid `$`-pattern interpretation in the source.
html = html.replace('<script defer src="app.js"></script>', () => `<script>${appjs}</script>`);
html = html.replace(/<script defer src="https:\/\/unpkg[^"]*"><\/script>/, () => "");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  pretendToBeVisual: true,
  url: "https://localhost/",
  beforeParse(w) {
    w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.scrollTo = () => {};
    w.requestAnimationFrame = (cb) => cb();
    w.L = undefined; // Leaflet not loaded in the test env; loadMap() is guarded.
  },
});

const w = dom.window;
const E = (code) => w.eval(code);
let passed = 0;
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  passed++;
}
const active = () => E("document.querySelector('.page.active').dataset.page");

try {
  // Routing — map is the home screen
  assert(active() === "map", "map should be the landing page");
  E("goPage('driver')");
  assert(active() === "driver" && E("document.getElementById('driverDash').innerHTML").includes("Your parking"), "driver dashboard renders");
  E("goPage('host')");
  assert(active() === "host" && E("document.getElementById('hostDash').innerHTML").includes("Host dashboard"), "host dashboard renders");
  E("goPage('map')");

  // Icons injected, zero emoji
  assert(E("document.querySelector('.find-btn .i')") != null, "static line-icons are injected");
  assert(E("document.querySelectorAll('.menu-row .i').length") >= 4, "drawer rows have icons");
  assert(!/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u2705\u2605\u26A1]/u.test(html + appjs), "no emoji in source");

  // Pricing engine (master-doc rules)
  assert(E("feeOf(4)") === 1.25 && Math.abs(E("feeOf(20)") - 3.4) < 1e-9, "service fee = max(17%, $1.25)");
  E("SURGE=true");
  assert(E("rateOf(AREAS[0],AREAS[0].spots[0])") === 20, "surge is capped at 2.5x the host floor");
  E("SURGE=false");
  assert(E("rateOf(AREAS[0],AREAS[0].spots[0])") === 8, "base rate equals the host floor");

  // Find-a-Spot recommendations
  E("openSheet()");
  assert(E("document.querySelectorAll('#recScroll .rec-item').length") > 0, "recommended spots populate");
  E("closeSheet()");

  // Full booking -> pass -> session -> extend -> checkout -> receipt
  const before = E("AREAS[1].spots[0].avail");
  E("startBooking(1,0)");
  assert(E("booking.hours") === 2 && E("modal.classList.contains('show')"), "booking modal opens");
  E("setHours(3)");
  assert(E("booking.hours") === 3, "hours adjust");
  E("goPay(); confirmPay(); finalizeBooking()");
  assert(E("AREAS[1].spots[0].avail") === before - 1, "availability decrements on booking");
  assert(E("msheet.innerHTML").includes("Address unlocked") && E("msheet.innerHTML").includes(E("AREAS[1].addr")), "pass reveals exact address");
  E("beginSession()");
  assert(E("DRIVER.session.active") === true, "session starts");
  E("doExtend(60)");
  assert(E("DRIVER.session.extended") === 60, "session extends");
  E("startLeaving()");
  assert(E("msheet.innerHTML").includes("Confirming departure"), "GPS geofence step");
  E("photoStep(); snap(); finishSession()");
  assert(E("msheet.innerHTML").includes("Session complete"), "receipt shows");
  E("rate(5)");
  assert(E("document.querySelectorAll('.stars .istar').length") === 5, "star rating uses SVG icons");
  E("endTrip(); clearInterval(sesTimer)");

  // Listing flows publish to both the map and the host dashboard
  E("startListing(); pickKind('residential')");
  const ai = E("AREAS.findIndex(a=>a.name===listing.label)");
  const spotsBefore = E(`AREAS[${ai}].spots.length`);
  const hostBefore = E("HOST.listings.length");
  E("previewList(); publishList()");
  assert(E(`AREAS[${ai}].spots.length`) === spotsBefore + 1 && E("HOST.listings.length") === hostBefore + 1, "residential listing publishes to map + host");
  E("startListing(); pickKind('urban'); previewList()");
  assert(E("msheet.innerHTML").includes("Certificate of Coverage"), "urban supply generates an insurance certificate");
  E("publishList()");

  // Theme toggle
  E("document.getElementById('themeSwitch').click()");
  assert(E("document.documentElement.getAttribute('data-theme')") === "dark", "dark mode toggles on");
  E("document.getElementById('themeSwitch').click()");
  assert(E("document.documentElement.getAttribute('data-theme')") === null, "dark mode toggles off");

  console.log(`\n  \u2713 ${passed} checks passed \u2014 all Pakere flows OK\n`);
} catch (err) {
  console.error(`\n  \u2717 FAILED: ${err.message}\n`);
  process.exitCode = 1;
} finally {
  try { w.close(); } catch {}
  process.exit(process.exitCode || 0);
}
