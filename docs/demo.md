# Demo video

**File:** [`demo.mp4`](demo.mp4) — 2:25, 780×1688 (phone aspect), captioned, no audio.

It is recorded from the real web build by `scripts/demo-video.mjs`, which drives the same UI the
screenshots use and captures Chrome's screencast. It asserts three things while recording (the
booking survives a reload, the festival payload is on screen, the tab labels come from config) and
exits non-zero if any of them fail — so the video cannot silently show the wrong state.

## What it shows

| Time | Scene |
| --- | --- |
| 0:00 | Title card |
| 0:03 | Home, normal config — scrolling all six section types |
| 0:25 | Booking: date, slot grid, optimistic confirm, success animation |
| 0:45 | Bookings tab, then a **reload** — the booking is still there (persisted store) |
| 1:00 | Prescriptions → schedule, marking a morning dose |
| 1:20 | Latency switch to "Very slow" — skeletons while slots load |
| 1:35 | Runtime switch to the Diwali payload: colours, copy, tab labels |
| 1:50 | The unimplemented `scratch_card` section renders nothing |
| 2:00 | Forced 409: optimistic rollback and inline explanation |
| 2:15 | Forced network failure: cached layout + banner |

## Re-record it

```bash
npx expo start --web     # leave running
npm run demo:video       # needs ffmpeg; FFMPEG=/path/to/ffmpeg overrides the path
```

Temporary frames land in `/private/tmp/tapza-demo-frames`; the encode is H.264/yuv420p so it plays
in browsers, QuickTime and GitHub's preview.

## If you would rather record your own

The script above is the reference performance. To do it by hand:

1. `npx expo start --web`, open it in a phone-sized browser window (390×844).
2. Clear demo data: **Profile → Reset doses and bookings**, then reload.
3. Follow the table above, pausing ~2 seconds on each caption-worthy moment.
4. Record with macOS `⌘⇧5` (Record Selected Portion) or QuickTime → New Screen Recording.
5. Export as MP4/H.264 and replace `docs/demo.mp4`.

Avoid referring to mock endpoints as if they were production; the demo switches are in
**Profile → Demo controls**.
