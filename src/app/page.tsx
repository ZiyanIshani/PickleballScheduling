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
    .select("id,user_id,date,start_time,end_time,signal_type,profiles(id,name)")
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
    for (let i = startIdx; i < endIdx; i++) {
      if (i < 0 || i >= cells.length) continue;
      cells[i].count += 1;
      cells[i].entries.push({ name, signalType: row.signal_type });
    }
  }

  const totalSignals = rows?.length ?? 0;

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      <Nav userName={profile?.name ?? user.email ?? ""} />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">North Hills Park</h1>
          <p className="text-sm text-neutral-500">
            {isToday(dates[0]) ? "Today" : formatDateLabel(dates[0])} –{" "}
            {formatDateLabel(dates[dates.length - 1])}
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            Couldn&apos;t load availability: {error.message}
          </p>
        )}

        {totalSignals === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
            No one has signaled availability for the next 7 days yet. Be the first —
            tap &ldquo;Add availability&rdquo; above.
          </div>
        ) : (
          <AggregatedGrid dates={dates} dayData={dayData} />
        )}
      </main>
    </div>
  );
}
