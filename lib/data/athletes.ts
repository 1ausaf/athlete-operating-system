import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type AthleteRow = Database["public"]["Tables"]["athletes"]["Row"];

/** Resolves `athletes.id` for a login profile (`profiles.id` / `auth.users.id`). */
export async function getAthleteIdForProfileId(
  profileId: string,
): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return (data as Pick<AthleteRow, "id">).id;
}

export async function getAthleteRowForProfileId(
  profileId: string,
): Promise<Pick<AthleteRow, "id" | "injury_flag"> | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("id, injury_flag")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Pick<AthleteRow, "id" | "injury_flag">;
}
