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
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUserWithProfile } from "@/lib/auth";
import {
  getActiveMembershipForAthlete,
  getBookingComplianceStatus,
} from "@/lib/data/memberships";
import { listUpcomingSessionsForAthlete } from "@/lib/data/sessions";
import { SessionBookForm } from "./session-book-form";

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

export default async function AthleteSessionsPage() {
  const user = await requireUserWithProfile();
  if (user.role !== "athlete") {
    redirect("/staff/athletes");
  }

  const [membership, compliance, upcoming] = await Promise.all([
    getActiveMembershipForAthlete(user.id),
    getBookingComplianceStatus(user.id, new Date()),
    listUpcomingSessionsForAthlete(user.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Athlete Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Sessions
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Book inside your membership cadence. Errors from the server (frequency,
          payment, capacity) are shown next to each session when booking fails.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Membership</CardTitle>
          <CardDescription>
            Active membership and 4-week booking compliance snapshot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {membership ? (
            <>
              <p>
                <span className="font-medium">Plan: </span>
                {membership.membership_plans?.name ?? "Unknown plan"} (
                {membership.membership_plans?.membership_frequency ?? "—"})
              </p>
              <p className="text-muted-foreground">
                Valid {new Date(membership.valid_from).toLocaleDateString()}
                {membership.valid_to
                  ? ` – ${new Date(membership.valid_to).toLocaleDateString()}`
                  : " – open-ended"}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              No active membership on file. You cannot book until a plan is
              assigned and in good standing.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">4-week booking compliance:</span>
            {compliance.compliant ? (
              <StatusBadge tone="ok">
                Met
                {compliance.furthestBookedSessionStart
                  ? ` · furthest ${new Date(
                      compliance.furthestBookedSessionStart,
                    ).toLocaleString()}`
                  : ""}
              </StatusBadge>
            ) : (
              <StatusBadge tone="warn">
                Not met — book a session four or more weeks out
              </StatusBadge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming sessions</CardTitle>
          <CardDescription>
            Scheduled blocks you can book. Already-booked sessions show as
            Booked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming scheduled sessions.
            </p>
          ) : (
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">When</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[120px]">Roster</TableHead>
                  <TableHead className="text-right">Book</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="align-top font-medium tabular-nums">
                      {formatRange(s.starts_at, s.ends_at)}
                    </TableCell>
                    <TableCell className="align-top text-muted-foreground">
                      {s.location?.trim() || "Location TBD"}
                    </TableCell>
                    <TableCell className="align-top text-muted-foreground">
                      {s.isBooked ? (
                        <StatusBadge tone="ok">Booked</StatusBadge>
                      ) : (
                        <span className="text-xs">Not booked</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <SessionBookForm sessionId={s.id} isBooked={s.isBooked} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
