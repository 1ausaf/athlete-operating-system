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
import {
  fetchStaffAthleteComplianceRoster,
  listBookingComplianceIssues,
  listNoteComplianceIssues,
  listPaymentComplianceIssues,
} from "@/lib/data/compliance";
import {
  formatPaymentStatusLabel,
  paymentStatusTone,
} from "@/lib/data/booking-status-labels";
import { isStaff } from "@/lib/rbac";
import {
  complianceToneToBadgeClass,
  statusToneToBadgeClass,
} from "@/lib/ui/status";

function formatDate(iso: string | null): string {
  if (!iso) return "none";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function notesForAthleteHref(profileId: string): Route {
  return `/staff/notes?athleteId=${encodeURIComponent(profileId)}` as Route;
}

export default async function StaffCompliancePage() {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const roster = await fetchStaffAthleteComplianceRoster();
  const [bookingIssues, noteIssues, paymentIssues] = await Promise.all([
    listBookingComplianceIssues(roster),
    listNoteComplianceIssues(roster),
    listPaymentComplianceIssues(roster),
  ]);

  const rosterHref = "/staff/athletes" as Route;
  const sessionsHref = "/staff/sessions" as Route;
  const billingHref = "/staff/billing" as Route;

  const gapBadgeClass = complianceToneToBadgeClass("bad");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Compliance
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Booking (4+ week horizon), weekly CAP notes, and membership or balance
          payment signals for athletes you can access under RLS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking compliance</CardTitle>
          <CardDescription>
            Athletes without a confirmed session on or after four weeks from
            today.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {bookingIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No booking compliance gaps in the visible roster.
            </p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Athlete</th>
                  <th className="py-2 pr-3 font-medium">Next session</th>
                  <th className="py-2 pr-3 font-medium">Furthest booked</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookingIssues.map((row) => (
                  <tr
                    key={row.athleteId}
                    className="border-b border-destructive/15 bg-destructive/[0.06]"
                  >
                    <td className="py-2 pr-3 font-medium">
                      {row.athleteFullName}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {formatDate(row.nextBookedSessionStartsAt)}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {formatDate(row.furthestBookedSessionStartsAt)}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={gapBadgeClass}>Non-compliant</span>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          href={notesForAthleteHref(row.athleteProfileId)}
                        >
                          Athlete / CAP
                        </Link>
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          href={rosterHref}
                        >
                          Roster
                        </Link>
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          href={sessionsHref}
                        >
                          Sessions
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Note compliance</CardTitle>
          <CardDescription>
            Athletes without a CAP note for the current UTC week (Monday
            anchor).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {noteIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No note gaps for the current week on the visible roster.
            </p>
          ) : (
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Athlete</th>
                  <th className="py-2 pr-3 font-medium">Last CAP note</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {noteIssues.map((row) => (
                  <tr
                    key={row.athleteId}
                    className="border-b border-destructive/15 bg-destructive/[0.06]"
                  >
                    <td className="py-2 pr-3 font-medium">
                      {row.athleteFullName}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {formatDate(row.lastCapNoteCreatedAt)}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={gapBadgeClass}>Non-compliant</span>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          href={notesForAthleteHref(row.athleteProfileId)}
                        >
                          CAP notes
                        </Link>
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          href={rosterHref}
                        >
                          Roster
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment compliance</CardTitle>
          <CardDescription>
            Active memberships not in paid / authorized / waived standing, or a
            positive billing balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {paymentIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payment issues on the visible roster.
            </p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Athlete</th>
                  <th className="py-2 pr-3 font-medium">Summary</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentIssues.map((row) => {
                  const tone = row.membershipPaymentStatus
                    ? paymentStatusTone(row.membershipPaymentStatus)
                    : row.balanceCents != null && row.balanceCents > 0
                      ? "bad"
                      : "neutral";
                  const badgeLabel =
                    row.membershipPaymentStatus != null
                      ? formatPaymentStatusLabel(row.membershipPaymentStatus)
                      : row.balanceCents != null && row.balanceCents > 0
                        ? "Balance due"
                        : "Issue";
                  return (
                    <tr
                      key={row.athleteId}
                      className="border-b border-destructive/15 bg-destructive/[0.06]"
                    >
                      <td className="py-2 pr-3 font-medium">
                        {row.athleteFullName}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {row.displayLabel}
                      </td>
                      <td className="py-2 pr-3">
                        <span className={statusToneToBadgeClass(tone)}>
                          {badgeLabel}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          <Link
                            className="text-primary underline-offset-4 hover:underline"
                            href={notesForAthleteHref(row.athleteProfileId)}
                          >
                            Athlete / CAP
                          </Link>
                          <Link
                            className="text-primary underline-offset-4 hover:underline"
                            href={billingHref}
                          >
                            Billing
                          </Link>
                          <Link
                            className="text-primary underline-offset-4 hover:underline"
                            href={sessionsHref}
                          >
                            Sessions
                          </Link>
                        </div>
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
