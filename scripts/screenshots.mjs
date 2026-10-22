/**
 * Headless smoke test + screenshot capture against the web build.
 *
 * Usage:
 *   1. npx expo start --web --port 8081
 *   2. npm run shots
 *
 * It drives the real UI (booking flow, dose marking, theme switch, offline
 * cache) and fails if the page throws. Output lands in docs/screenshots.
 */
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP_URL = process.env.APP_URL ?? "http://localhost:8081";
const OUT = "docs/screenshots";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--force-device-scale-factor=2"],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

// Deterministic runs: doses/bookings/variant from earlier sessions would
// otherwise leak into the screenshots.
await page.evaluateOnNewDocument(() => window.localStorage.clear());

const problems = [];
const failures = [];

function check(label, condition) {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}`);
  if (!condition) failures.push(label);
}

const bodyText = () => page.evaluate(() => document.body.innerText);
page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") problems.push(`console.error: ${message.text()}`);
});

async function shot(name) {
  await sleep(450);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`snapshot  ${OUT}/${name}.png`);
}

async function clickText(text, { exact = true, index = 0 } = {}) {
  const find = () =>
    page.evaluate(
      ({ text, exact, index }) => {
        const selector = '[role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="switch"]';
        const matchesText = (value) => (exact ? value === text : value.includes(text));

        // Prefer real interactive nodes; this avoids matching a giant ancestor
        // whose textContent happens to contain the label.
        const interactive = [...document.querySelectorAll(selector)].filter((el) =>
          matchesText((el.textContent ?? "").trim()),
        );

        let target = interactive[index];
        if (!target) {
          const leaves = [...document.querySelectorAll("div, span, p, a")].filter((el) => {
            const value = (el.textContent ?? "").trim();
            if (!matchesText(value)) return false;
            return ![...el.children].some((child) => matchesText((child.textContent ?? "").trim()));
          });
          const node = leaves[index];
          target = node?.closest(selector) ?? node;
        }

        if (!target) return null;
        target.scrollIntoView({ block: "center" });
        const rect = target.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      },
      { text, exact, index },
    );

  const point = await find();
  if (!point) throw new Error(`Could not find tappable text: "${text}"`);

  // Scrolling can still be settling, so re-measure before committing the tap.
  await sleep(350);
  const fresh = await find();
  await page.mouse.click((fresh ?? point).x, (fresh ?? point).y);
  await sleep(650);
}

/** Tab bar entries are real links (`role="tab"` + href), so target the route. */
async function clickTab(screen) {
  const point = await page.evaluate((href) => {
    const target = document.querySelector(`a[role="tab"][href="${href}"]`);
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }, `/${screen}`);
  if (!point) throw new Error(`Could not find tab for /${screen}`);
  await page.mouse.click(point.x, point.y);
  await sleep(700);
}

/** Clicks the "Book" button inside a specific doctor card. */
async function clickDoctorBook(doctorName) {
  const point = await page.evaluate((name) => {
    const buttons = [...document.querySelectorAll('[role="button"]')].filter(
      (el) => (el.textContent ?? "").trim() === "Book",
    );
    const target = buttons.find((el) => {
      let node = el;
      for (let depth = 0; depth < 7 && node; depth += 1) {
        if ((node.textContent ?? "").includes(name)) return true;
        node = node.parentElement;
      }
      return false;
    });
    if (!target) return null;
    target.scrollIntoView({ block: "center" });
    const rect = target.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }, doctorName);

  if (!point) throw new Error(`No Book button in the ${doctorName} card`);
  await page.mouse.click(point.x, point.y);
  await sleep(900);
}

async function tapFirstAvailableSlot() {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('[role="button"]')].some((el) =>
        /^\d{1,2}:\d{2} (am|pm)$/.test((el.textContent ?? "").trim()),
      ),
    { timeout: 15_000 },
  );

  const locate = () =>
    page.evaluate(() => {
      const buttons = [...document.querySelectorAll('[role="button"]')];
      const slots = buttons.filter(
        (el) =>
          /^\d{1,2}:\d{2} (am|pm)$/.test((el.textContent ?? "").trim()) &&
          el.getAttribute("aria-disabled") !== "true",
      );
      const target = slots[0];
      if (!target) return null;
      target.scrollIntoView({ block: "center" });
      const rect = target.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

  const point = await locate();
  if (!point) throw new Error("No available slot found");
  await sleep(350);
  const fresh = await locate();
  await page.mouse.click((fresh ?? point).x, (fresh ?? point).y);
  await sleep(500);
}

await page.goto(APP_URL, { waitUntil: "domcontentloaded", timeout: 180_000 });
await page.waitForFunction(() => document.body.innerText.includes("Tapza Care"), {
  timeout: 180_000,
});
await sleep(3000);
await shot("01-home-normal");

// A section band further down the page (scroll-triggered animation).
await page.mouse.move(195, 600);
await page.mouse.wheel({ deltaY: 720 });
await sleep(900);
await shot("02-home-scrolling");

// Booking sheet from the first doctor card.
await clickDoctorBook("Dr. Ananya Rao");
await shot("03-booking-sheet");

await tapFirstAvailableSlot();
await clickText("Confirm", { exact: false, index: 0 });
await sleep(1100);
await shot("04-booking-confirmed");

await clickText("Done");
await sleep(700);

// Bookings tab.
await clickTab("bookings");
await shot("05-bookings");
{
  const text = await bodyText();
  check("booking appears in the visits tab", text.includes("Dr. Ananya Rao") && text.includes("Confirmed"));
}

// Prescriptions → detail → mark a dose.
await clickTab("prescriptions");
await shot("06-prescriptions");
await clickText("View schedule");
await shot("07-prescription-detail");

const firstDose = await page.evaluate(() => {
  const el = document.querySelector('[role="checkbox"]');
  if (!el) return null;
  el.scrollIntoView({ block: "center" });
  const rect = el.getBoundingClientRect();
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
});
if (firstDose) {
  await page.mouse.click(firstDose.x, firstDose.y);
  await sleep(500);
  await shot("08-dose-taken");
  const checked = await page.evaluate(
    () => document.querySelector('[role="checkbox"]')?.getAttribute("aria-checked") === "true",
  );
  check("dose mark persists in the schedule", checked);
}

// Profile / demo controls.
await clickTab("profile");
await shot("09-profile-demo-controls");

// Switch the layout at runtime: same code, different config + theme.
await clickText("Diwali");
await sleep(1500);
await clickTab("home");
await sleep(1200);
await shot("10-home-festival");
{
  const text = await bodyText();
  check("festival config swaps the home sections", text.includes("Diwali health packages"));
  check("festival config re-labels the tabs", text.includes("Visits") && text.includes("You"));
  check("normal-only copy is gone", !text.includes("What do you need today?"));
}

// Kill the network, then switch back: cached layout must still render.
await clickTab("profile");
await sleep(600);
await page.evaluate(() => {
  const rows = [...document.querySelectorAll("div")];
  const label = rows.find((el) => (el.textContent ?? "").trim().startsWith("Fail every request"));
  const toggle = label?.parentElement?.querySelector('input[type="checkbox"], [role="switch"]');
  if (toggle) toggle.click();
});
await sleep(500);
await clickText("Normal day");
await sleep(1800);
await clickTab("home");
await sleep(1000);
await shot("11-offline-cached-layout");
{
  const text = await bodyText();
  check("failed request keeps the cached layout", text.includes("What do you need today?"));
  check("offline banner explains the cache", text.includes("Showing your saved layout"));
}

await browser.close();

if (failures.length > 0) {
  console.error("\nBehaviour checks failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
}

if (problems.length > 0) {
  console.error("\nRuntime problems:");
  for (const problem of problems) console.error(` - ${problem}`);
  process.exitCode = 1;
} else {
  console.log("\nNo page errors or console errors.");
}
