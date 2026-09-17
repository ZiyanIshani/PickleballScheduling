import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRollingWindowDates, isToday, formatDateLabel } from "@/lib/dates";
import { SLOTS_PER_DAY, timeToSlotIndex } from "@/lib/time-grid";
import { Nav } from "@/components/Nav";
import { AggregatedGrid, type SlotCell } from "@/components/AggregatedGrid";
import type { AvailabilityWithProfile } from "@/lib/types";

export default async function CourtViewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const dates = getRollingWindowDates();

  const { data: rows, error } = await supabase
    .from("availability")
    .select("id,user_id,date,start_time,end_time,signal_type,profiles(id,name,dupr_rating)")
    .in("date", dates)
    .order("date")
    .order("start_time")
    .returns<AvailabilityWithProfile[]>();

  const dayData: Record<string, SlotCell[]> = {};
  for (const date of dates) {
    dayData[date] = Array.from({ length: SLOTS_PER_DAY }, () => ({ count: 0, entries: [] }));
  }

  for (const row of rows ?? []) {
    const cells = dayData[row.date];
    if (!cells) continue;
    const startIdx = timeToSlotIndex(row.start_time);
    const endIdx = timeToSlotIndex(row.end_time);
    const name = row.profiles?.name ?? "Someone";
    const duprRating = row.profiles?.dupr_rating ?? null;
    for (let i = startIdx; i < endIdx; i++) {
      if (i < 0 || i >= cells.length) continue;
      cells[i].count += 1;
      cells[i].entries.push({ name, signalType: row.signal_type, duprRating });
    }
  }

  const totalSignals = rows?.length ?? 0;

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      <Nav userName={profile?.name ?? user.email ?? ""} />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              North Hills Park
            </h1>
            <p className="text-sm text-neutral-500">
              {isToday(dates[0]) ? "Today" : formatDateLabel(dates[0])} –{" "}
              {formatDateLabel(dates[dates.length - 1])}
            </p>
          </div>
          {totalSignals > 0 && (
            <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {totalSignals} signal{totalSignals === 1 ? "" : "s"} this week
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Couldn&apos;t load availability: {error.message}
          </p>
        )}

        {totalSignals === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-8 text-center shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.008v.008H3.75V6.75Zm0 5.25h.008v.008H3.75V12Zm0 5.25h.008v.008H3.75v-5.25Z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">No one&apos;s signaled yet</p>
            <p className="max-w-xs text-sm text-neutral-500">
              Be the first — tap &ldquo;Edit availability&rdquo; above to let others know when
              you&apos;re playing.
            </p>
          </div>
        )}

        <AggregatedGrid dates={dates} dayData={dayData} />
      </main>
    </div>
  );
}
