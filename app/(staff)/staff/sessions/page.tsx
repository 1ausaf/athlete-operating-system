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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="flex flex-col gap-4">
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
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
          ) : (
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Coach</TableHead>
                  <TableHead className="tabular-nums">Confirmed</TableHead>
                  <TableHead className="text-right">Roster</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => {
                  const rosterHref = `/staff/sessions/${s.id}` as Route;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium tabular-nums">
                        {formatRange(s.starts_at, s.ends_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.location?.trim() || "—"}
                      </TableCell>
                      <TableCell>{s.primaryCoachName ?? "—"}</TableCell>
                      <TableCell className="tabular-nums">
                        {s.confirmedCount} / {s.capacity}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={rosterHref}
                          className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                        >
                          View roster
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
