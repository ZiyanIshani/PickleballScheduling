"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRollingWindowDates } from "@/lib/dates";
import { SLOTS_PER_DAY, slotIndexToTime } from "@/lib/time-grid";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const duprRatingRaw = String(formData.get("duprRating") ?? "").trim();

  if (!name) {
    throw new Error("Display name can't be empty.");
  }

  let dupr_rating: number | null = null;
  if (duprRatingRaw !== "") {
    dupr_rating = Number(duprRatingRaw);
    if (!Number.isFinite(dupr_rating) || dupr_rating < 1 || dupr_rating > 8) {
      throw new Error("DUPR rating must be a number between 1 and 8.");
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name, dupr_rating })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/profile");
}

type Interval = { start: string; end: string };

// Merge overlapping/touching intervals (same signal type) into their union.
function unionIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  const merged: Interval[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end) {
      if (cur.end > last.end) last.end = cur.end;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

// Remove every `subtract` interval from `base`, splitting base intervals as needed.
function subtractIntervals(base: Interval[], subtract: Interval[]): Interval[] {
  let result = base;
  for (const sub of subtract) {
    const next: Interval[] = [];
    for (const b of result) {
      if (sub.end <= b.start || sub.start >= b.end) {
        next.push(b);
        continue;
      }
      if (sub.start > b.start) next.push({ start: b.start, end: sub.start });
      if (sub.end < b.end) next.push({ start: sub.end, end: b.end });
    }
    result = next;
  }
  return result.filter((iv) => iv.start < iv.end);
}

export async function addAvailability(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const startIndex = Number(formData.get("startIndex"));
  const endIndex = Number(formData.get("endIndex"));
  const signalType = String(formData.get("signalType") ?? "");

  if (!getRollingWindowDates().includes(date)) {
    throw new Error("Date is outside the current 7-day window.");
  }
  if (
    !Number.isInteger(startIndex) ||
    !Number.isInteger(endIndex) ||
    startIndex < 0 ||
    endIndex >= SLOTS_PER_DAY ||
    endIndex < startIndex
  ) {
    throw new Error("Invalid time selection.");
  }
  if (signalType !== "thinking" && signalType !== "going") {
    throw new Error("Invalid signal type.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select("id")
    .eq("name", "North Hills Park")
    .single();
  if (courtError || !court) {
    throw new Error("Court not found — has the schema been seeded?");
  }

  const start_time = slotIndexToTime(startIndex);
  const end_time = slotIndexToTime(endIndex + 1);

  // A user can only have one signal per moment in time — merge this range
  // with any of their own existing rows on this date that it overlaps,
  // rather than inserting a second row that double-counts shared slots.
  // "going" always takes precedence over "thinking" wherever the two
  // overlap, regardless of which one was submitted first or second, so a
  // day can still hold separate thinking/going blocks side by side.
  const { data: existing, error: existingError } = await supabase
    .from("availability")
    .select("id,start_time,end_time,signal_type")
    .eq("user_id", user.id)
    .eq("date", date);
  if (existingError) {
    throw new Error(existingError.message);
  }

  const newRange: Interval = { start: start_time, end: end_time };
  const overlaps = (row: Interval) => row.start < end_time && row.end > start_time;

  const overlappingGoing = (existing ?? []).filter(
    (row) => row.signal_type === "going" && overlaps({ start: row.start_time, end: row.end_time }),
  );
  const overlappingThinking = (existing ?? []).filter(
    (row) => row.signal_type === "thinking" && overlaps({ start: row.start_time, end: row.end_time }),
  );

  let finalGoing: Interval[] = [];
  let finalThinking: Interval[] = [];
  const idsToDelete: string[] = [];

  if (signalType === "going") {
    finalGoing = unionIntervals([
      newRange,
      ...overlappingGoing.map((row) => ({ start: row.start_time, end: row.end_time })),
    ]);
    finalThinking = subtractIntervals(
      overlappingThinking.map((row) => ({ start: row.start_time, end: row.end_time })),
      [newRange],
    );
    idsToDelete.push(...overlappingGoing.map((row) => row.id), ...overlappingThinking.map((row) => row.id));
  } else {
    const thinkingUnion = unionIntervals([
      newRange,
      ...overlappingThinking.map((row) => ({ start: row.start_time, end: row.end_time })),
    ]);
    finalThinking = subtractIntervals(
      thinkingUnion,
      overlappingGoing.map((row) => ({ start: row.start_time, end: row.end_time })),
    );
    idsToDelete.push(...overlappingThinking.map((row) => row.id));
  }

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase.from("availability").delete().in("id", idsToDelete);
    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  const rowsToInsert = [
    ...finalGoing.map((iv) => ({
      user_id: user.id,
      court_id: court.id,
      date,
      start_time: iv.start,
      end_time: iv.end,
      signal_type: "going" as const,
    })),
    ...finalThinking.map((iv) => ({
      user_id: user.id,
      court_id: court.id,
      date,
      start_time: iv.start,
      end_time: iv.end,
      signal_type: "thinking" as const,
    })),
  ];

  if (rowsToInsert.length > 0) {
    const { error } = await supabase.from("availability").insert(rowsToInsert);
    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/");
  redirect(`/add?date=${date}`);
}

export async function deleteAvailability(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Missing availability id.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("availability")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/add");
}
