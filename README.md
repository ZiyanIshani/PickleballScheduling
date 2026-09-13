# North Hills Pickleball Availability (M0)

See [CLAUDE.md](./CLAUDE.md) for the full product spec. This is the M0 build:
single hardcoded court, email/password auth, a LettuceMeet-style 30-minute
grid, and a rolling 7-day aggregated view.

Stack: Next.js (App Router) + Supabase (Postgres + Auth), deployed to Vercel.

## 1. Create the Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql). This
   creates the `courts`, `profiles`, and `availability` tables, seeds the
   single "North Hills Park" court, sets up row-level security, and adds a
   trigger that creates a `profiles` row whenever someone signs up.
3. In **Project Settings → Data API**, copy the Project URL and the `anon`
   public key.
4. In **Authentication → URL Configuration**, add your local dev URL
   (`http://localhost:3000`) and your eventual production URL to the
   redirect allow list — needed for email confirmation / magic links to
   redirect back into the app's `/auth/callback` route.
5. (Optional for faster internal testing) In **Authentication → Providers →
   Email**, you can turn off "Confirm email" so signup logs you in
   immediately instead of requiring an email click-through.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign up, and add availability for North Hills
Park to confirm the loop works end to end.

## 4. Deploy

Push this repo to GitHub, then import it into [Vercel](https://vercel.com/new).
Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings, then deploy.
Add the resulting `https://your-app.vercel.app` URL to Supabase's redirect
allow list (see step 1.4) so auth email links work in production.

## How the rolling window works

The home page always queries `today <= date <= today + 6` computed at
request time (`src/lib/dates.ts`) — there's no stored "week" or batch job.
Past days simply stop matching the query and disappear from the view on
their own.
