import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserWithProfile } from "@/lib/auth";
import { listUpcomingSessionsForStaff } from "@/lib/data/sessions";
import { isStaff } from "@/lib/rbac";

function formatRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const d = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const t = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(end);
  return `${d} – ${t}`;
}

export default async function StaffSessionsPage() {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const sessions = await listUpcomingSessionsForStaff();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Sessions
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Upcoming scheduled sessions. Open a row for roster detail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule</CardTitle>
          <CardDescription>
            All future scheduled sessions (RLS may filter by role in your
            Supabase project).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
          ) : (
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Location</th>
                  <th className="py-2 pr-4 font-medium">Coach</th>
                  <th className="py-2 pr-4 font-medium">Confirmed</th>
                  <th className="py-2 font-medium">Roster</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const rosterHref = `/staff/sessions/${s.id}` as Route;
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 align-top">
                        {formatRange(s.starts_at, s.ends_at)}
                      </td>
                      <td className="py-3 pr-4 align-top text-muted-foreground">
                        {s.location?.trim() || "—"}
                      </td>
                      <td className="py-3 pr-4 align-top">
                        {s.primaryCoachName ?? "—"}
                      </td>
                      <td className="py-3 pr-4 align-top tabular-nums">
                        {s.confirmedCount} / {s.capacity}
                      </td>
                      <td className="py-3 align-top">
                        <Link
                          href={rosterHref}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          View roster
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
