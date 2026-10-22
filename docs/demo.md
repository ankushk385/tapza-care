# Demo video

The recording is the one deliverable I cannot produce here (no phone, no screen recorder on this
machine). This file is the script so it takes one take, not five.

**Target length:** 2–3 minutes. **Format:** screen recording of the web build at a phone aspect
ratio (390×844), or Expo Go on an Android phone if available.

Save it as `docs/demo.mp4` and update this file with a link if you host it elsewhere.

## Before recording

```bash
npx expo start --web
```

Open `http://localhost:8081`, then resize the browser to a phone shape (DevTools → toggle device →
iPhone 12 Pro). Clear demo data first: **Profile → Reset doses and bookings**. Reload so the app
starts from the normal config with a clean cache state.

## Script

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
