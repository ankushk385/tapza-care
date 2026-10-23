# Demo video

**Recorded:** [`demo.mp4`](demo.mp4) — 1:44, 780×1688 (2× a 390×844 phone), H.264, 3.5 MB, no audio.
The narration is burned in as captions, so it plays anywhere without a voice track.

It is a real capture of the web build, not a mockup: `scripts/demo-video.mjs` drives the app in
headless Chrome, records timestamped frames through CDP `Page.startScreencast`, and encodes them
with ffmpeg. The script also asserts what is on screen at each step, so a broken recording fails
instead of shipping a pretty-but-wrong video.

## What it shows

1. The home screen rendered from `GET /config`: hero, chips, quick actions, service grid, doctor
   carousel, offer strip. Scroll motion without a re-render per frame.
2. Booking: open a doctor, pick a date and a free slot, confirm, success panel. Slots come from
   `GET /slots`; taken slots are disabled, not hidden.
3. The booking survives a reload — it is persisted locally, not refetched from a server.
4. Prescriptions: per-medicine morning / afternoon / night doses, 44pt checkboxes, ticks stored
   per day.
5. Latency as a switch: skeletons while the 2.5 s "network" answers.
6. Runtime config switch to the Diwali payload: colours, copy, offers — and the tab labels change
   from Bookings/Profile to Visits/You, with no reload and no rebuild.
7. Unknown content: the festival payload contains a `scratch_card` section this build never
   implemented. It renders nothing and does not crash, on purpose.
8. Failure handling: a forced 409 rolls back the optimistic booking and explains why; a total
   network failure keeps the last good layout on screen with a cached banner.
9. Reset back to a clean state.

## Re-record it

Requires the web dev server, Google Chrome, and ffmpeg.

```bash
npx expo start --web          # leave running on http://localhost:8081
npm run demo:video            # node scripts/demo-video.mjs
```

- ffmpeg is not a project dependency. The script uses `ffmpeg` from `PATH`, or the static binary at
  `/private/tmp/ffmpeg-tool/node_modules/ffmpeg-static/ffmpeg` if that exists. Point it anywhere else
  with `FFMPEG=/path/to/ffmpeg npm run demo:video`; on macOS, `brew install ffmpeg` is simplest.
- Chrome is expected at the default macOS path; override with `CHROME=/path/to/chrome`.
- `APP_URL` overrides the dev-server URL.
- The script writes frames to `/private/tmp/tapza-demo-frames`, then encodes `docs/demo.mp4`.
  It exits non-zero if any scene assertion fails, so check the output before committing.
- Re-recording takes about two minutes of real time; the capture runs at variable frame rate
  (frames are only emitted when the page repaints).

## Manual storyboard (if you record by hand)

| Time | Do | Say (or caption) |
| --- | --- | --- |
| 0:00 | Home, normal config. Slowly scroll once, top to bottom. | "The whole home screen is rendered from `GET /config`. The hero, the chips, the grid, the doctor carousel — no layout in the app." |
| 0:15 | Tap a doctor's **Book**. Pick a date, pick a time. | "The sheet is a custom Reanimated sheet — drag it down to dismiss. Slots come from `GET /slots`." |
| 0:30 | Tap **Confirm**, let the success animation play. | "Confirm is optimistic: the slot is marked taken immediately, then reconciled. This is the 800 ms latency simulator, not a real network." |
| 0:40 | **Done → Bookings.** | "The booking persists across reloads." |
| 0:50 | **Medicines →** open the prescription. Tap a morning dose, then a night one. | "Morning, afternoon, night. Each dose is a 44pt checkbox and ticks are stored per day." |
| 1:05 | **Profile → Demo controls → Layout: Diwali.** | "Same code, different payload." |
| 1:12 | **Home.** Pause on the hero, point at the tab bar. | "Colours, type, greeting, even the tab labels change: Bookings becomes Visits, Profile becomes You." |
| 1:25 | Scroll to the section after the doctors. | "The payload contains a `scratch_card` section this build has never implemented. It renders nothing and doesn't crash — on purpose." |
| 1:35 | **Profile → 409 on next booking.** Home → book any slot → Confirm. | "Someone grabbed the slot first. The optimistic update rolls back and the sheet explains why." |
| 1:50 | **Profile → Fail every request.** Home. | "The fetch fails, the last good config is still on screen, and the banner says so." |
| 2:05 | Toggle failure off, **Reset doses and bookings**. | "That's the app: config-driven, cached, and honest about failure." |

## Things to show, not tell

- Long-press the home title to switch configs (the hidden shortcut).
- The tab bar re-labels itself in the festival config — that is the clearest proof the nav is
  data-driven.
- The `scratch_card` section: it is third from the top of the festival payload and simply absent.
