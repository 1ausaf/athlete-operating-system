"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserWithProfile } from "@/lib/auth";
import { createCapNoteForAthlete } from "@/lib/data/cap-notes";
import { isStaff } from "@/lib/rbac";

export async function createCapNoteAction(formData: FormData) {
  const user = await getCurrentUserWithProfile();
  if (!user || !isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const athleteProfileId = String(formData.get("athleteProfileId") ?? "").trim();
  const athleteRowId = String(formData.get("athleteRowId") ?? "").trim();
  const context = String(formData.get("context") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const plan = String(formData.get("plan") ?? "").trim();

  const back = `/staff/notes?athleteId=${encodeURIComponent(athleteProfileId)}`;

  if (!athleteProfileId || !athleteRowId) {
    redirect(`${back}&error=${encodeURIComponent("Missing athlete selection.")}`);
  }

  if (!context || !action || !plan) {
    redirect(`${back}&error=${encodeURIComponent("Context, action, and plan are required.")}`);
  }

  const res = await createCapNoteForAthlete({
    authorProfileId: user.id,
    athleteId: athleteRowId,
    context,
    action,
    plan,
  });

  if (!res.ok) {
    redirect(`${back}&error=${encodeURIComponent(res.message)}`);
  }

  revalidatePath("/staff/notes");
  redirect(back);
}
