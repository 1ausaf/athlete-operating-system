import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserWithProfile } from "@/lib/auth";
import { getAthleteRowForProfileId } from "@/lib/data/athletes";
import { listCapNotesForAthlete } from "@/lib/data/cap-notes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/rbac";

import { createCapNoteAction } from "./actions";

interface PageProps {
  searchParams: { athleteId?: string; error?: string };
}

export default async function StaffNotesPage({ searchParams }: PageProps) {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const athleteProfileId = searchParams.athleteId?.trim() ?? "";
  const error = searchParams.error?.trim();

  if (!athleteProfileId) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Staff Workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            CAP Notes
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Add <code className="rounded bg-muted px-1">?athleteId=&lt;profile-uuid&gt;</code>{" "}
            to the URL to load an athlete and their notes.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", athleteProfileId)
    .maybeSingle();

  const profile = profileRaw as { id: string; full_name: string | null } | null;
  const athleteRow = await getAthleteRowForProfileId(athleteProfileId);
  const notes = await listCapNotesForAthlete(athleteProfileId, 50);

  const athleteName =
    profile?.full_name?.trim() || "Unknown athlete";

  if (!athleteRow) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">CAP Notes</h1>
        <p className="text-sm text-muted-foreground">
          No athlete record for profile <code className="rounded bg-muted px-1">{athleteProfileId}</code>.
        </p>
      </div>
    );
  }

  const notesIndex = "/staff/notes" as Route;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          CAP Notes
        </h1>
        <p className="text-sm text-muted-foreground">
          Athlete: <span className="font-medium text-foreground">{athleteName}</span>
          {" · "}
          Injury flag: {athleteRow.injury_flag ? "yes" : "no"}
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent notes</CardTitle>
          <CardDescription>Newest first. Body stores JSON CAP v1 when authored from this form.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No CAP notes yet.</p>
          ) : (
            <ul className="space-y-4">
              {notes.map((n) => (
                <li key={n.id} className="rounded-md border p-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()} · week{" "}
                    {n.note_week_start}
                  </p>
                  {n.cap ? (
                    <div className="mt-2 space-y-1">
                      <p>
                        <span className="font-medium">Context: </span>
                        {n.cap.context}
                      </p>
                      <p>
                        <span className="font-medium">Action: </span>
                        {n.cap.action}
                      </p>
                      <p>
                        <span className="font-medium">Plan: </span>
                        {n.cap.plan}
                      </p>
                    </div>
                  ) : (
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs">
                      {n.body}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New CAP note</CardTitle>
          <CardDescription>
            Submits as staff via server action (RLS must allow your role).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCapNoteAction} className="flex max-w-xl flex-col gap-3">
            <input type="hidden" name="athleteProfileId" value={athleteProfileId} />
            <input type="hidden" name="athleteRowId" value={athleteRow.id} />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Context</span>
              <textarea
                name="context"
                required
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Action</span>
              <textarea
                name="action"
                required
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Plan</span>
              <textarea
                name="plan"
                required
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-2">
              <Button type="submit">Save note</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={notesIndex}>Clear athlete filter</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
