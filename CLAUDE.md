# spec.md — Pickleball Scheduling: M1 wrap-up → M2 prep

Last updated: 2026-09-14, based on session notes from 2026-09-13 and 2026-09-14.

## Where things stand

- **Live**: https://pickleball-scheduling.vercel.app (Vercel project
  `ziyan10/pickleball-scheduling`, Supabase project `tjyvpyuudcqrxyxlrhdl`).
- **Code**: `main` is pushed (commit `fff3d87`) and should match production —
  worth a quick visual confirm that the card-style auth pages and new density
  legend are actually showing live, not just locally.
- **Data**: Supabase is clean. Only `ziyanishani@gmail.com` remains as a user;
  no availability rows exist yet (test data was fully purged).
- **Auth redirect URLs**: confirmed correct in Supabase → Authentication →
  URL Configuration. No action needed.
- **DUPR badge**: gating decision made — no badge shown when `dupr_rating`
  is null. Closed, no further work.
- **UI pass**: done this session (Geist font, hover/focus states, card
  layout for login/signup, friendlier empty states, 6-tier density legend
  in `intensityClass()` in `src/components/AggregatedGrid.tsx`).
- **Known gap**: no Supabase service-role key available locally. Any
  privileged/admin DB work (bulk deletes, migrations outside RLS) has to go
  through the Supabase Dashboard in-browser, not a local script.

## Outstanding before shipping v1 publicly

1. **Real phone-browser pass (highest priority, still not done)**
   - Full loop: signup → drag-select availability on `/add` → view
     aggregated grid.
   - Must be an actual phone. Automated mobile-viewport emulation was
     unreliable this session (`window.innerWidth` didn't track requested
     resize dimensions) — don't retry that approach; test on real hardware.
2. **Confirm the live deploy matches the latest push**
   - Visually check `pickleball-scheduling.vercel.app` for the new
     card-style auth pages and the 6-tier density legend.
3. **Seed real data (M1)**
   - Add a few of Areef's own real upcoming plans so the calendar isn't
     empty when regulars first look at it.
4. **Recruit 5–10 regulars directly**
   - Direct text/DM outreach, not a cold FB post — get real usage before
     any public announcement.
5. **M2 launch**
   - Once M1 usage feels real, post to the North Hills FB group with a
     pitch tied to the group's actual coordination pain point (per
     CLAUDE.md's roadmap).

## Context worth knowing for the next session

- **Timezone fix**: `src/lib/dates.ts` computes "today" via a fixed IANA
  timezone (`America/New_York`, North Hills Park's timezone) using
  `Intl.DateTimeFormat`, and formats labels with explicit `"en-US"` locale.
  This was a real hydration-mismatch bug fix (React error #418, surfaced
  as #441 in production) — don't reintroduce bare `new Date()` or
  locale-dependent formatting into date logic.
- Vercel rejects `TZ` as an env var name — timezone handling must stay
  code-level, not env-based.
- CLAUDE.md is the source of truth for the M0/M1/M2 roadmap and "definition
  of done" checklists; this spec reflects where the M1 checklist stands as
  of 2026-09-14.

  User Notes
  1. I tried loading the website on my phone and it looks good/functions as expected
  2. Add a way so users can edit their profiles. Specifically allow them to edit DUPR as its a dynamic rating and display name in case they want to be anonymous
  3. Extend the scheduling hours to go until 10pm

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
