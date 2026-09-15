import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/Nav";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name,dupr_rating")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      <Nav userName={profile?.name ?? user.email ?? ""} />
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-4 py-6">
        <h1 className="mb-1 text-lg font-semibold text-neutral-900">Edit profile</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Update your display name or DUPR rating. Others will see these on the aggregated
          schedule.
        </p>
        <ProfileForm
          initialName={profile?.name ?? ""}
          initialDuprRating={profile?.dupr_rating ?? null}
        />
      </main>
    </div>
  );
}
