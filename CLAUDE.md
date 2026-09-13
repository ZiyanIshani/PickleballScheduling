# North Hills Pickleball Availability — M0 Spec

## Purpose

Prove the core mechanic works: users can signal when they're planning to
play at North Hills Park, and see an aggregated view of who else might be
there, without needing hard RSVPs or manual calendar upkeep.

M0 is not shown to the FB group yet — it's the internal build to validate
the loop before seeding it with real regulars (M1) and launching publicly
(M2).

## Scope (M0 only)

In scope:

- Single hardcoded court: North Hills Park
- Account creation / login
- Add availability (day + time block + soft/hard signal)
- Rolling 7-day aggregated view
- Automatic expiry of past days

Out of scope (explicitly deferred):

- Multiple courts / cities
- DUPR verification/integration, or any skill-based matching logic
- Push notifications or reminders
- Social features beyond seeing names on a slot
- Anything resembling a native mobile app (mobile web only)

## Data model

**User**

- id
- name (display name)
- contact (email or phone — for account identity only, not shown publicly
  unless the user chooses)
- dupr_rating (optional, self-entered at signup — not verified in M0)
- created_at

**Court**

- id
- name ("North Hills Park")
- (no other fields needed yet — single hardcoded row is fine for M0)

**Availability**

- id
- user_id (FK -> User)
- court_id (FK -> Court, always North Hills for M0)
- date (the specific calendar date, not a recurring rule)
- start_time / end_time (the specific window the user highlighted — see
  Time Grid below)
- signal_type (enum: "thinking" | "going")
- created_at

No "recurring availability" concept in M0 — every entry is for one specific
date. Recurring patterns can be a later convenience feature once the core
loop is validated.

## Time grid (LettuceMeet-style)

Broad blocks (e.g. a single "9am–4pm" midday block) hide exactly the
information that matters — someone could highlight that block at 9am and
someone else at 3pm and never actually overlap. Instead, use a
fine-grained grid similar to LettuceMeet:

- Fixed daily range, e.g. 6am–9pm (adjustable later, but a bounded range
  keeps the grid a reasonable size rather than covering all 24 hours).
- Grid resolution: 30-minute slots. Hourly might be too coarse for a
  single court where a couple hours' difference matters; 30 minutes
  balances precision against too many tiny cells to tap through.
- Users click/drag across contiguous slots to highlight the window they're
  considering (e.g., dragging from 5:00pm to 6:30pm marks three 30-minute
  slots in one motion) rather than tapping each slot individually.
- The aggregated view overlays everyone's highlighted slots for that day,
  so overlap is visually obvious — a 5:00-6:00pm stretch with several
  people's highlights stacked reads immediately as "this is when people are
  actually going," rather than a same-count-different-time false positive
  in a broad block.

Same grid shape for weekdays and weekends in M0 — don't add
day-of-week-specific ranges before seeing real usage; adjust once you see
when people actually play.

## Core screens

**1. Court view (home screen)**

- 7 columns (today through today+6), always rolling — computed as
  `today <= date <= today + 6`, recalculated on every page load. No batch
  job, no "week reset" logic.
- Each column shows the 30-minute grid for that day (6am–9pm).
- Each slot is shaded/counted by how many people have a highlight covering
  it, so overlapping windows visually stack into an obvious "hot" stretch
  rather than being flattened into one same-count block.
- Tapping/clicking a highlighted stretch expands to show who's signaled
  and whether they're "thinking" or "going."
- Days that have fully passed simply disappear from the view — no explicit
  "expire" action needed, since the query itself excludes past dates.

**2. Add availability**

- Pick a date (within the current rolling 7-day window), then click-and-
  drag across the grid to highlight the contiguous window being
  considered (e.g., 5:00–6:30pm in one motion, not slot-by-slot taps).
- Choose signal type: "thinking about it" or "going for sure."
- Submit — should be completable in a few seconds, no multi-step wizard.
- A user can have multiple entries across different days/windows; adding a
  new one shouldn't require removing old ones.

**3. Auth**

- Minimal — email/password or a magic link.
- Signup includes an optional DUPR rating field (self-entered, not
  verified against DUPR in M0 — just stored for now).
- No social login or profile pictures needed yet.

## Non-goals / guardrails for M0

- Don't build a generic multi-court framework yet — hardcode North Hills.
  Multi-court support is easy to add later once the single-court loop is
  proven; building it generically now is speculative work.
- Don't build recurring/repeating availability yet — one-off entries per
  date are enough to test whether the core loop is useful.
- Don't add notifications, reminders, or messaging — the whole point is a
  glanceable aggregated view, not another communication channel.

## Definition of done for M0

- You can log in, add availability for a real upcoming day/block at North
  Hills, and see it reflected (with your name) in the aggregated view.
- The 7-day window correctly rolls forward day-to-day without any manual
  intervention.
- Past days disappear from the view automatically.
- The app is deployed at a real, shareable URL (not localhost) and usable
  on a phone browser.

Once this is true, move to M1: seed real data yourself, recruit 5-10
regulars directly, then prepare for the FB group launch (M2).

## Future roadmap (explicitly post-M0)

- DUPR is collected at signup now specifically so it's already in the data
  model when this becomes relevant later — not used for anything in M0.
- Longer-term direction: use stored DUPR ratings (and eventually court
  data across multiple locations) to power AI-driven suggestions — e.g.,
  recommending courts/times where players of a similar skill level are
  likely to show up, or surfacing good match-ups among people who've
  signaled for the same window.
- None of this is built in M0 — it's noted here so the data model doesn't
  need to be reworked later to support it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
