# AI log

I used an AI coding agent (OpenCode, running a large general model) as a pair programmer for the
whole build. I drove: the brief interpretation, the stack choices, the schema, what to cut, and
every review pass. The agent wrote most of the first draft of the code, tests and docs. This log is
the honest account of that collaboration — including what it got wrong.

## Ground rules I set

1. **One source of truth for types:** zod schemas, infer everything else. No `any` at the wire.
2. **Colour discipline:** no hex outside `src/theme/tokens.ts`, `src/lib/color.ts` and the mock
   payloads. This was enforced with a test, not trust.
3. **Unknown config must not crash.** Unknown section types skip; unknown icons fall back; unknown
   tabs cannot exist (closed enum).
4. **Every state designed:** loading, empty, error, offline, 409. No bare spinners on content.
5. **Small, explainable primitives** over libraries. Every dependency must earn its place.

## Prompts that shaped the build

| # | Prompt (paraphrased) | What came back | What I changed |
| --- | --- | --- | --- |
| 1 | "Scaffold Expo SDK 58 + TypeScript strict, no router yet. Explain what each dependency is for." | Blank TS template, dependency list, rationale | Dropped `@gorhom/bottom-sheet` after deciding to write the sheet myself; kept the rest |
| 2 | "Design the config schema for a Zepto-style home: hero, chips, quick actions, service grid, doctor carousel, offer strip. Section `type` must be open, theme must be untrusted." | `src/types/config.ts` with zod + inferred types | Made `type: z.string()` rather than an enum, so future sections parse; added `parseOrThrow` with readable paths |
| 3 | "Build a safe palette from the config theme. Text must stay WCAG AA on both background and surface, and `onPrimary` must adapt." | `buildTheme.ts` + colour maths | Added the 3:1 clamp for `primary` itself (the first version only fixed text); added `onOverlay` after a white-text-on-light-scrim bug |
| 4 | "Mock the five endpoints with latency, one-shot failure, empty lists and a forced 409. Slots must be deterministic per doctor/date." | `handlers.ts`, `client.ts`, zustand settings store | Booked slots moved to a `Set` so a second booking really 409s; added `slotIdToTime` so a stored booking can render its time |
| 5 | "Home screen: one scroll shared value driving a collapsing header, hero parallax and per-band reveal. No per-frame JS." | `HomeScreen`, `HomeHeader`, `AnimatedSection` | Replaced an early `useState` scroll listener; section offsets measured with `onLayout` |
| 6 | "Booking sheet with drag-to-dismiss on Reanimated + Gesture Handler, date strip, slot grid, optimistic confirm, 409 recovery, success animation." | `BookingSheet.tsx`, `SuccessPanel.tsx` | Sheet drag limited to the header so it cannot fight the slot grid; date strip cut from 7 to 5 days to keep 44pt targets |
| 7 | "Write four test suites: config edge cases, booking conflict, theme contrast, and a guard that fails on colour literals." | Tests | Added a "hostile config" case that the first draft missed (pale primary on pale background) |
| 8 | "Drive the web build in headless Chrome: book, mark a dose, switch config, force a failure. Assert, screenshot, fail on console errors." | `scripts/screenshots.mjs` | Rewrote the click helper twice — see bugs below |

## Bugs the AI shipped (and how they were caught)

These are the useful entries. All were found by reading code, running `tsc`, or driving the app.

1. **`@gorhom/bottom-sheet` was the first answer for the sheet.** It pulled a native dependency and
   a web-compatibility question for something that is ~60 lines of Reanimated. I removed the
   package. The dependency list now matches what the code uses.
2. **`React.ComponentProps` without importing `React`.** `tsc` caught it; replaced with
   `import type { ComponentProps } from "react"`.
3. **`StyleSheet.absoluteFillObject` does not exist in RN 0.88's generated types.** Replaced with
   explicit `top/left/right/bottom: 0`.
4. **Hard-coded white ripple and a hard-coded `"transparent"` border.** Both violated my own rule;
   replaced with `theme.colors.border` / `theme.colors.skeleton`. The colour-literal test now makes
   this impossible.
5. **White text on a light scrim after the festival switch.** The overlay base was derived from the
   background, but `onOverlay` was always white. Added `onOverlay: readableOn(overlayBase)` and used
   it everywhere over imagery. This is exactly why the theme builder exists.
6. **`App.tsx` imported `./api/queries` instead of `./src/api/queries`.** The agent assumed the file
   sat next to `App.tsx`. `tsc` caught it immediately.
7. **A handler referenced `actions.onBookServiceLabel`, which was never defined.** Same class of
   mistake: plausible name, no implementation. Fixed to call the real action.
8. **The config query used a 5-minute `staleTime`, which broke the offline demo.** Switching back
   to a variant served fresh cache and never hit the (failing) network, so no offline banner. Set
   `staleTime: 0` for config with a comment: a layout endpoint should revalidate.
9. **`accessibilityState={{ checked }}` did not produce `aria-checked` on web** for the dose rows.
   The visual state was correct, so a screenshot would have hidden it. Added `aria-checked`
   explicitly and made the smoke test assert it.
10. **The first headless smoke test clicked the wrong thing.** `text.includes("Confirm")` matched a
    giant ancestor first, and the test clicked the page background, closing the sheet. Fixed by
    preferring `role="button" | "tab" | "link"` nodes and re-measuring after `scrollIntoView`
    (scroll animations made coordinates stale). The harness now fails loudly instead of taking a
    pretty-but-wrong screenshot.
11. **Playwright could not install Chromium on macOS 12.** Switched to `puppeteer-core` driving the
    locally installed Chrome. No browser download, same result.
12. **TypeScript 6 did not pick up `@types/jest` globals** even though the package was installed.
    Added `"types": ["jest"]` to `tsconfig.json` and kept `tsc --noEmit` green.

## Where I overruled the agent

- **Expo Router vs React Navigation.** The agent's default for a new Expo app is Expo Router (and
  the repo's `AGENTS.md` says so). The brief requires the tab bar — order, labels, icons, existence
  — to come from config, including a payload that renames two tabs. File-based routing would fight
  that. I kept React Navigation and documented the reason in the README rather than silently
  ignoring the convention.
- **No i18n, no push notifications, no admin screen.** Tempting scope, ~4 hours. Cut and listed in
  the README instead of half-built.
- **No fabricated EAS link.** The agent cannot log into my Expo account, so the README has a
  placeholder and a one-command build profile rather than an invented URL.
- **Copy review.** The agent's first draft of the empty/error copy was generic ("Something went
  wrong"). Rewrote it in the clinic's voice ("Your medicines are safe — try again").

## What the AI did not verify

- Anything on a physical device: haptics, native stack transitions, keyboard behaviour, real font
  scaling. I have no phone, emulator, or Xcode/Android SDK here.
- Visual judgement. I verified the DOM, computed styles, contrast ratios, and behaviour assertions
  in headless Chrome, but a human still has to look at the screenshots and the demo video.
- The EAS build itself. `eas.json` is ready; the build needs my account.

## Prompts I would write next time

- "Sketch the state machine for the booking sheet before writing components: idle → slot selected →
  pending → confirmed | conflict." It would have caught the pending/optimistic ambiguity earlier.
- "List every string the user will see, then write copy for empty/error/offline in one pass." Copy
  written component-by-component drifts.
