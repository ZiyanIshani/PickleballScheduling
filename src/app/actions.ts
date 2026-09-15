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

  const { error } = await supabase.from("availability").insert({
    user_id: user.id,
    court_id: court.id,
    date,
    start_time,
    end_time,
    signal_type: signalType,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}
