import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRollingWindowDates } from "@/lib/dates";
import { EditAvailabilityClient } from "@/components/EditAvailabilityClient";
import type { Availability } from "@/lib/types";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function EditAvailabilityPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const dates = getRollingWindowDates();
  const { date: requestedDate } = await searchParams;
  const initialDate = dates.includes(requestedDate ?? "") ? requestedDate! : dates[0];

  const { data: rows } = await supabase
    .from("availability")
    .select("id,date,start_time,end_time,signal_type")
    .eq("user_id", user.id)
    .in("date", dates)
    .order("date")
    .order("start_time")
    .returns<Pick<Availability, "id" | "date" | "start_time" | "end_time" | "signal_type">[]>();

  return (
    <EditAvailabilityClient dates={dates} initialDate={initialDate} initialRows={rows ?? []} />
  );
}
