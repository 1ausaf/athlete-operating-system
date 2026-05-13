import { redirect } from "next/navigation";

import { isMinorFromDateOfBirth } from "@/lib/is-minor";
import { MEMBERSHIP_PAYMENT_ALLOWED_FOR_BOOKING } from "@/lib/data/membership-payment-rules";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";
import type { AppUser, UserRole } from "@/types/user";

type DbUserRole = Database["public"]["Enums"]["user_role"];

type ProfileFields = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "full_name" | "date_of_birth" | "email"
>;

type AthleteIdRow = Pick<Database["public"]["Tables"]["athletes"]["Row"], "id">;

type MembershipWindowRow = Pick<
  Database["public"]["Tables"]["memberships"]["Row"],
  "id" | "valid_to"
>;

const ROLE_PRIORITY: Record<UserRole, number> = {
  athlete: 0,
  coach: 1,
  admin: 2,
  owner: 3,
};

const USER_ROLES: readonly UserRole[] = [
  "athlete",
  "coach",
  "admin",
  "owner",
] as const;

function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

/** When a user has multiple rows in `user_roles`, use the highest privilege. */
export function pickPrimaryRole(
  roles: readonly DbUserRole[],
): UserRole | null {
  let best: UserRole | null = null;
  let score = -1;
  for (const r of roles) {
    if (!isUserRole(r)) continue;
    const p = ROLE_PRIORITY[r];
    if (p > score) {
      score = p;
      best = r;
    }
  }
  return best;
}

async function loadHasActiveMembership(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  profileId: string,
): Promise<boolean> {
  const { data: athleteRaw } = await supabase
    .from("athletes")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  const athlete = athleteRaw as AthleteIdRow | null;
  if (!athlete) return false;

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const { data: rowsRaw, error } = await supabase
    .from("memberships")
    .select("id, valid_to")
    .eq("athlete_id", athlete.id)
    .eq("status", "active")
    .in("payment_status", [...MEMBERSHIP_PAYMENT_ALLOWED_FOR_BOOKING])
    .lte("valid_from", nowIso);

  const rows = rowsRaw as MembershipWindowRow[] | null;
  if (error || !rows?.length) return false;

  return rows.some((m) => {
    if (m.valid_to == null) return true;
    return new Date(m.valid_to).getTime() >= nowMs;
  });
}

/**
 * Loads the signed-in user mapped to `AppUser`, or null if there is no
 * session or required profile / role data is missing. Does not redirect —
 * use in Route Handlers and other JSON APIs.
 */
export async function loadAppUser(): Promise<AppUser | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profileRaw, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, email")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileRaw as ProfileFields | null;
  if (profileError || !profile) return null;

  const { data: roleRowsRaw, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", user.id);

  const roleRows = roleRowsRaw as { role: DbUserRole }[] | null;
  if (rolesError || !roleRows?.length) return null;

  const roles = roleRows.map((r) => r.role);
  const role = pickPrimaryRole(roles);
  if (!role) return null;

  const email = user.email ?? profile.email ?? "";
  const fullName =
    profile.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "User";

  const isMinor = isMinorFromDateOfBirth(profile.date_of_birth);

  const appUser: AppUser = {
    id: user.id,
    email,
    fullName,
    role,
    isMinor,
  };

  if (role === "athlete") {
    appUser.hasActiveMembership = await loadHasActiveMembership(
      supabase,
      user.id,
    );
  }

  return appUser;
}

/**
 * Returns the signed-in user mapped to `AppUser`, or null if there is no
 * session or required profile / role data is missing.
 */
export async function getCurrentUserWithProfile(): Promise<AppUser | null> {
  return loadAppUser();
}

export async function requireUserWithProfile(): Promise<AppUser> {
  const user = await loadAppUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}
