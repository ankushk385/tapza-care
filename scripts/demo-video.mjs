/**
 * Records docs/demo.mp4 from the real web build.
 *
 * Chrome's CDP `Page.startScreencast` gives timestamped frames only when the
 * page repaints, so the result is a variable-frame-rate capture of the actual
 * UI. A caption bar (injected into the page) narrates the flow; it is
 * pointer-transparent so it can never eat a click.
 *
 * Usage:
 *   1. npx expo start --web --port 8081
 *   2. node scripts/demo-video.mjs   (or: npm run demo:video)
 *
 * Needs ffmpeg on PATH, or point FFMPEG at a binary. Requires Google Chrome at
 * the macOS path below (override with CHROME=...).
 */
import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import puppeteer from "puppeteer-core";

const run = promisify(execFile);
const CHROME =
  process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP_URL = process.env.APP_URL ?? "http://localhost:8081";
const TEMP_FFMPEG = "/private/tmp/ffmpeg-tool/node_modules/ffmpeg-static/ffmpeg";
const FFMPEG = process.env.FFMPEG ?? (existsSync(TEMP_FFMPEG) ? TEMP_FFMPEG : "ffmpeg");
const FRAMES = "/private/tmp/tapza-demo-frames";
const OUTPUT = "docs/demo.mp4";

const WIDTH = 390;
const HEIGHT = 844;
const SCALE = 2;

/**
 * Slightly slower than real time: captions need a beat to be read, and the
 * recording lands in the 2-3 minute range the brief asks for.
 */
const PACE = 1.14;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms * PACE));
const failures = [];

function check(label, condition) {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}`);
  if (!condition) failures.push(label);
}

const bodyText = () => page.evaluate(() => document.body.innerText);

if (FFMPEG.includes("/") && !existsSync(FFMPEG)) {
  console.error(`ffmpeg not found at ${FFMPEG}. Set FFMPEG=/path/to/ffmpeg.`);
  process.exit(1);
}

await rm(FRAMES, { recursive: true, force: true });
await mkdir(FRAMES, { recursive: true });
await mkdir("docs", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", `--window-size=${WIDTH},${HEIGHT}`],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE });

/* ---------------------------------------------------------------- captions */

async function installCaptions() {
  await page.evaluate(() => {
    const bar = document.createElement("div");
    bar.id = "__demo_caption";
    Object.assign(bar.style, {
      position: "fixed",
      left: "14px",
      right: "14px",
      bottom: "92px",
      padding: "10px 14px",
      borderRadius: "14px",
      background: "rgba(8, 18, 16, 0.88)",
      color: "#FFFFFF",
      font: "500 13px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      letterSpacing: "0.1px",
      boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
      zIndex: "2147483647",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 220ms ease",
    });
    document.body.appendChild(bar);

    const title = document.createElement("div");
    title.id = "__demo_title";
    Object.assign(title.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "32px",
      textAlign: "center",
      background: "rgba(8, 18, 16, 0.94)",
      color: "#FFFFFF",
      font: "600 22px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      zIndex: "2147483647",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 320ms ease",
    });
    title.innerHTML =
      '<span style="font-size:11px;letter-spacing:2px;opacity:.65">REACT NATIVE + EXPO</span>' +
      "<span>Tapza Care</span>" +
      '<span style="font-size:13px;font-weight:400;opacity:.8;max-width:260px">' +
      "One config payload drives the layout, the theme and the tab bar." +
      "</span>";
    document.body.appendChild(title);
  });
}

async function caption(text, { position = "bottom" } = {}) {
  await page.evaluate(
    ({ text, position }) => {
      const bar = document.getElementById("__demo_caption");
      if (!bar) return;
      bar.textContent = text;
      if (position === "top") {
        bar.style.bottom = "auto";
        bar.style.top = "14px";
      } else {
        bar.style.top = "auto";
        bar.style.bottom = "92px";
      }
      bar.style.opacity = text ? "1" : "0";
    },
    { text, position },
  );
}

async function titleCard(visible) {
  await page.evaluate((show) => {
    const title = document.getElementById("__demo_title");
    if (title) title.style.opacity = show ? "1" : "0";
  }, visible);
}

/* ------------------------------------------------------------------ clicks */

async function clickText(text, { exact = true, index = 0 } = {}) {
  const locate = () =>
    page.evaluate(
      ({ text, exact, index }) => {
        const selector =
          '[role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="switch"]';
        const matches = (value) => (exact ? value === text : value.includes(text));

        let target = [...document.querySelectorAll(selector)].filter((el) =>
          matches((el.textContent ?? "").trim()),
        )[index];

        if (!target) {
          const leaves = [...document.querySelectorAll("div, span, p, a")].filter((el) => {
            const value = (el.textContent ?? "").trim();
            if (!matches(value)) return false;
            return ![...el.children].some((child) => matches((child.textContent ?? "").trim()));
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

  const point = await locate();
  if (!point) throw new Error(`Could not find tappable text: "${text}"`);
  await sleep(350);
  const fresh = await locate();
  await page.mouse.click((fresh ?? point).x, (fresh ?? point).y);
  await sleep(650);
}

async function clickTab(screen) {
  const point = await page.evaluate((href) => {
    const target = document.querySelector(`a[role="tab"][href="${href}"]`);
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }, `/${screen}`);
  if (!point) throw new Error(`No tab for /${screen}`);
  await page.mouse.click(point.x, point.y);
  await sleep(700);
}

/** Clicks the Book button of a specific doctor card. */
async function clickDoctorBook(doctorName) {
  const locate = () =>
    page.evaluate((name) => {
      const target = [...document.querySelectorAll('[role="button"]')]
        .filter((el) => (el.textContent ?? "").trim() === "Book")
        .find((el) => {
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

  const point = await locate();
  if (!point) throw new Error(`No Book button in the ${doctorName} card`);
  await sleep(400);
  const fresh = await locate();
  await page.mouse.click((fresh ?? point).x, (fresh ?? point).y);
  await sleep(1000);
}

async function tapFirstAvailableSlot() {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('[role="button"]')].some((el) =>
        /^\d{1,2}:\d{2} (am|pm)$/.test((el.textContent ?? "").trim()),
      ),
    { timeout: 20_000 },
  );

  const locate = () =>
    page.evaluate(() => {
      const target = [...document.querySelectorAll('[role="button"]')].find(
        (el) =>
          /^\d{1,2}:\d{2} (am|pm)$/.test((el.textContent ?? "").trim()) &&
          el.getAttribute("aria-disabled") !== "true",
      );
      if (!target) return null;
      target.scrollIntoView({ block: "center" });
      const rect = target.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

  const point = await locate();
  if (!point) throw new Error("No available slot");
  await sleep(400);
  const fresh = await locate();
  await page.mouse.click((fresh ?? point).x, (fresh ?? point).y);
  await sleep(600);
}

async function scrollBy(deltaY, steps = 6) {
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel({ deltaY: deltaY / steps });
    await sleep(120);
  }
}

async function toggleDemoSwitch(label) {
  const ok = await page.evaluate((text) => {
    const control = [...document.querySelectorAll('[role="switch"], input[type="checkbox"]')].find(
      (el) => {
        let node = el;
        for (let depth = 0; depth < 4 && node; depth += 1) {
          if ((node.textContent ?? "").includes(text)) return true;
          node = node.parentElement;
        }
        return false;
      },
    );
    if (!control) return false;
    control.click();
    return true;
  }, label);
  if (!ok) throw new Error(`No demo switch for "${label}"`);
  await sleep(500);
}

/* ---------------------------------------------------------------- recorder */

const client = await page.createCDPSession();
const frames = [];
let frameIndex = 0;
let writing = Promise.resolve();

client.on("Page.screencastFrame", (event) => {
  const index = frameIndex += 1;
  frames.push({ file: `frame-${String(index).padStart(5, "0")}.jpg`, time: event.metadata.timestamp });
  writing = writing.then(() =>
    writeFile(join(FRAMES, `frame-${String(index).padStart(5, "0")}.jpg`), Buffer.from(event.data, "base64")),
  );
  client.send("Page.screencastFrameAck", { sessionId: event.sessionId }).catch(() => {});
});

async function startRecording() {
  await client.send("Page.startScreencast", {
    format: "jpeg",
    quality: 82,
    maxWidth: WIDTH * SCALE,
    maxHeight: HEIGHT * SCALE,
    everyNthFrame: 1,
  });
}

/* -------------------------------------------------------------------- flow */

console.log("loading app…");
await page.goto(APP_URL, { waitUntil: "domcontentloaded", timeout: 180_000 });
await page.waitForFunction(() => document.body.innerText.includes("Tapza Care"), {
  timeout: 180_000,
});

// Start from a clean store, and reload once so the persisted defaults are the
// ones the video shows (the mid-video reload later proves they survive).
await page.evaluate(() => window.localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded", timeout: 180_000 });
await page.waitForFunction(() => document.body.innerText.includes("Tapza Care"), {
  timeout: 180_000,
});
await sleep(2500);
await installCaptions();

await startRecording();

await titleCard(true);
await sleep(2600);
await titleCard(false);
await sleep(500);

await caption("The whole home screen is rendered from GET /config — the app ships no layout of its own.");
await sleep(3400);
await scrollBy(520, 8);
await caption("Hero, chips, quick actions, service grid, doctor carousel, offer strip: six section types.");
await sleep(3200);
await scrollBy(620, 8);
await caption("Colours, type scale and radii come from the same payload — no colour literals in components.");
await sleep(3400);

await scrollBy(-1600, 10);
await caption("Book a visit. Slots come from GET /slots for the chosen doctor and date.");
await sleep(1800);
await clickDoctorBook("Dr. Ananya Rao");
await caption("Unavailable slots are disabled, not hidden — the day stays legible.", { position: "top" });
await sleep(2400);
await tapFirstAvailableSlot();
await sleep(900);
await caption("POST /bookings is optimistic: the slot locks before the server answers.", {
  position: "top",
});
await clickText("Confirm", { exact: false });
await sleep(2800);
await caption("Confirmed. If the server says 409, the optimistic update is rolled back.");
await sleep(2200);
await clickText("Done");
await sleep(700);

await clickTab("bookings");
await caption("Bookings survive a reload — the store is persisted locally.");
await sleep(1800);
await page.reload({ waitUntil: "domcontentloaded", timeout: 180_000 });
await page.waitForFunction(() => document.body.innerText.includes("Tapza Care"), {
  timeout: 180_000,
});
await sleep(2200);
await installCaptions();
await startRecording();
await clickTab("bookings");
await caption("Reloaded. Same booking, no server round-trip — the store is persisted.");
await sleep(3200);
{
  const text = await bodyText();
  check("booking survives the reload", text.includes("Dr. Ananya Rao") && text.includes("Confirmed"));
}

await clickTab("prescriptions");
await caption("Prescriptions: each one opens a morning / afternoon / night schedule.");
await sleep(2800);
await clickText("View schedule");
await sleep(1200);
await caption("Every dose is a 44pt checkbox and the tick is stored per day.");
await sleep(2200);
await page.evaluate(() => {
  const el = document.querySelector('[role="checkbox"]');
  if (!el) return;
  el.scrollIntoView({ block: "center" });
});
await sleep(500);
const dose = await page.evaluate(() => {
  const el = document.querySelector('[role="checkbox"]');
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
});
if (dose) {
  await page.mouse.click(dose.x, dose.y);
  await sleep(900);
}
await caption("Marked taken. Same tokens, same targets, no separate “mobile” build.");
await sleep(2600);

await clickTab("profile");
await caption("Latency is a switch too — useful for seeing the loading states.");
await sleep(2200);
await clickText("Very slow");
await clickTab("home");
await sleep(500);
await clickDoctorBook("Dr. Vikram Reddy");
await caption("A 2.5 second round-trip: skeletons while the slots land, not a frozen screen.", {
  position: "top",
});
await sleep(3200);
await page.mouse.click(WIDTH / 2, 40);
await sleep(600);
await clickTab("profile");
await clickText("Instant");
await sleep(500);

await clickTab("profile");
await caption("A demo panel exposes every failure mode: latency, errors, empty lists, 409.");
await sleep(3000);
await clickText("Diwali");
await sleep(1400);
await clickTab("home");
await caption("Switch config at runtime. Same components, different payload — no reload, no rebuild.");
await sleep(3600);
await scrollBy(1500, 10);
await caption("This payload also contains a `scratch_card` section this build never implemented. " +
  "It renders nothing, and nothing crashes.");
await sleep(3600);
{
  const text = await bodyText();
  check("festival payload is on screen", text.includes("Diwali health packages"));
  check("tab labels come from config", text.includes("Visits") && text.includes("You"));
}

await clickTab("profile");
await caption("Force a 409 on the next booking.");
await sleep(900);
await toggleDemoSwitch("409 on next booking");
await clickTab("home");
await sleep(700);
await clickDoctorBook("Dr. Ananya Rao");
await caption("Someone else took the slot first — the server answers 409.", { position: "top" });
await sleep(1500);
await tapFirstAvailableSlot();
await clickText("Confirm", { exact: false });
await sleep(2600);
await caption("The optimistic slot is restored and the sheet explains what happened.", {
  position: "top",
});
await sleep(2200);
await page.mouse.click(WIDTH / 2, 60);
await sleep(800);

await clickTab("profile");
await caption("Now kill the network entirely.");
await sleep(1200);
await toggleDemoSwitch("Fail every request");
await clickTab("home");
await sleep(2000);
await caption("The last good config is still on screen, with a banner saying it is cached.");
await sleep(3800);

await clickTab("profile");
await toggleDemoSwitch("Fail every request");
await sleep(600);
await caption("Reset, and it is a clean app again.");
await sleep(1400);

await titleCard(true);
await sleep(4000);
await titleCard(false);
await sleep(400);

await client.send("Page.stopScreencast");
await writing;
await browser.close();

/* ------------------------------------------------------------------ encode */

const frameCount = frames.length;
if (frameCount < 20) {
  console.error(`Only ${frameCount} frames captured — aborting.`);
  process.exit(1);
}

const last = frames[frameCount - 1];
const lines = [];
for (let i = 0; i < frameCount; i += 1) {
  const frame = frames[i];
  const next = frames[i + 1];
  const duration = Math.min(2, Math.max(0.033, (next ? next.time : last.time + 0.6) - frame.time));
  lines.push(`file '${join(FRAMES, frame.file)}'`);
  lines.push(`duration ${duration.toFixed(3)}`);
}
lines.push(`file '${join(FRAMES, frames[frameCount - 1].file)}'`);
lines.push("duration 0.5");
await writeFile(join(FRAMES, "list.txt"), `${lines.join("\n")}\n`);

const duration = frames[frameCount - 1].time - frames[0].time;
console.log(`${frameCount} frames, ~${duration.toFixed(1)}s of screen time`);

await run(FFMPEG, [
  "-y",
  "-f", "concat",
  "-safe", "0",
  "-i", join(FRAMES, "list.txt"),
  "-vsync", "vfr",
  "-vf", "scale=780:1688:flags=lanczos,format=yuv420p",
  "-c:v", "libx264",
  "-preset", "medium",
  "-crf", "24",
  "-movflags", "+faststart",
  OUTPUT,
]);

console.log(`wrote ${OUTPUT}`);

if (failures.length > 0) {
  console.error("\nScenes recorded, but these checks failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
}
