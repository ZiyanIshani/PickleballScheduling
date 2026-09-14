# North Hills Pickleball Availability — M0 Wrap-up / M1 Readiness Spec

## Status

M0 is built and deployed to production:
**https://pickleball-scheduling.vercel.app**

Repo: `ziyan10/pickleball-scheduling`, deployed via Vercel, backed by
Supabase (project `tjyvpyuudcqrxyxlrhdl`).

Core loop (signup → add availability via drag-to-select grid → see
aggregated view) has been verified working end-to-end on desktop Chrome,
including a fix for a real production bug (see below). Phone-browser
verification has not yet been done.

## Bug fixed this session

**Symptom**: "Minified React error #441" when submitting availability.

**Root cause**: a server/client hydration mismatch (React error #418).
Vercel's server runs in UTC; the browser runs in local time. Two places in
`src/lib/dates.ts` — `getRollingWindowDates()` and `isToday()` — called
bare `new Date()`, so server-rendered HTML and the client's hydrated
render could disagree about what date "today" is (specifically during the
hours when it's already tomorrow in UTC but still today in North Hills'
local time). `formatDateLabel()` also used a locale-dependent
`toLocaleDateString(undefined, …)` call, which can differ between server
and client for the same reason. The mismatch caused React to discard and
remount the date-driven tree, which is why the drag-to-select grid on
`/add` became unreliable and submissions could surface as the generic,
production-masked error #441.

**Fix**: `src/lib/dates.ts` now computes "today" using a fixed IANA
timezone (`America/New_York`, North Hills Park's timezone) via
`Intl.DateTimeFormat`, and formats labels with an explicit `"en-US"`
locale, so server and client always agree regardless of where each runs.
(A `TZ` env var was tried first but Vercel rejects it as a reserved name —
the code-level fix is arguably more correct anyway, since it doesn't
depend on platform env var support.)

Verified by reproducing the original error live on the production URL,
then confirming after the fix that the console is clean and the full
drag → select → submit → aggregated-view loop works.

## Spec/reality divergence: DUPR display

The original M0 spec (`CLAUDE.md`) explicitly marks DUPR as **collected
but not displayed or used** in M0 — stored at signup only, for future
AI-matching use.

This session, DUPR display was added to the aggregated view on direct
request: clicking a time slot now shows each attendee's name, DUPR rating
(if set), and signal type ("thinking" / "going"). Players without a rating
simply show no badge — not an explicit design decision, just the default
behavior.

Changed files: `src/lib/types.ts` (added `dupr_rating` to the `profiles`
pick), `src/app/page.tsx` (select `dupr_rating` in the availability
query), `src/components/AggregatedGrid.tsx` (render a "DUPR X.X" badge
next to the name when present).

Flagging this explicitly since it's a deliberate scope expansion beyond
the original spec, not an oversight — worth deciding if it should be
retroactively folded into the spec or left as a noted exception.

## Outstanding items before showing this to real users (M1)

1. **Clean up test data in Supabase.** ✅ Done (2026-09-14). The list
   above was actually stale — the Auth Users table had 5 test accounts,
   not the 3 originally documented (`aishani+m0test@hotmail.com`,
   `aishani+m0test2@hotmail.com`, and one seeded with the misleadingly
   real-looking display name "Sam Regular" at `aishani+m0test4@hotmail.com`,
   in addition to the documented `smoketest` and `duprtest2` accounts).
   `aishani+duprtest@hotmail.com` was confirmed never to have completed
   signup, so there was nothing to delete for it. All 5 test accounts were
   deleted via Supabase Dashboard → Authentication → Users (cascades to
   their `profiles`/`availability` rows). Only `ziyanishani@gmail.com`
   remains.

2. **Confirm Supabase auth redirect URL allow-list.** ✅ Already done.
   Checked Supabase → Authentication → URL Configuration — the production
   URL `https://pickleball-scheduling.vercel.app` is already in the
   Redirect URLs allow-list, along with the Vercel-generated preview URL
   patterns. No action was needed.

3. **Do a real phone-browser pass.** Still outstanding. Automated
   viewport-resize/emulation wasn't reliable in this session's browser
   automation environment (`window.innerWidth` didn't track the
   requested size), so this still needs a manual pass on an actual phone:
   signup → drag-select availability → view aggregated grid.

4. **DUPR badge gating: keep as-is.** ✅ Decided (2026-09-14) — no badge
   shown when `dupr_rating` is null. No code change needed.

   4.5 **UI cleanup pass.** ✅ Done (2026-09-14). Kept the white/emerald
   scheme; changes: switched `body` off the Arial fallback onto the
   already-configured Geist font, hover/focus states added across nav
   links, buttons, and form inputs, login/signup wrapped in a card layout,
   friendlier empty state copy on the court view, and the aggregated grid's
   density legend reworked (see below). Verified by running the app
   locally end-to-end (signup → add availability → aggregated view) via
   browser automation.

   Also reworked the aggregated-grid heat-map thresholds on request: was
   0 / 1 / 2 / 3+ people, now 6 tiers — none, 1–4, 5–9, 10–14, 15–19, and
   20+ (darkest) — so the grid has headroom to look meaningful once real
   regulars are using it, not just 0-3 people. See `intensityClass()` in
   `src/components/AggregatedGrid.tsx`.

5. **Push to `origin/main`.** Done as part of this session's commit — see
   git log.

## Next steps (per the original M0 → M1 → M2 roadmap)

Once items 1–5 above are resolved and M0 feels solid:

- **M1**: seed real data yourself (a few real upcoming plans so the
  calendar isn't empty), then recruit 5–10 regulars you already play with
  directly (text/DM, not a cold post) to get real usage going before the
  wider announcement.
- **M2**: post to the North Hills FB group with a pitch tied directly to
  the group's actual coordination pain point.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
