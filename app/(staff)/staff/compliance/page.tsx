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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComplianceStatusBadge,
  StatusBadge,
} from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const issueRowClass =
  "border-destructive/20 bg-destructive/[0.06] hover:bg-destructive/[0.08]";

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

  return (
    <div className="flex flex-col gap-4">
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Narrow the roster and issue lists (stubbed — wiring comes next).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="grid max-w-xs gap-2">
              <Label htmlFor="compliance-athlete">Athlete</Label>
              <Input
                id="compliance-athlete"
                disabled
                placeholder="Search by name…"
              />
            </div>
            <div className="grid max-w-xs gap-2">
              <Label>Issue type</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="All issues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All issues</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="notes">CAP notes</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="secondary" disabled>
              Apply filters
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Coming soon — filters do not affect the tables below yet.
          </p>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">Booking</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking compliance</CardTitle>
            <CardDescription>
              Athletes without a confirmed session on or after four weeks from
              today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No booking compliance gaps in the visible roster.
              </p>
            ) : (
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Next session</TableHead>
                    <TableHead>Furthest booked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingIssues.map((row) => (
                    <TableRow key={row.athleteId} className={issueRowClass}>
                      <TableCell className="font-medium">
                        {row.athleteFullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(row.nextBookedSessionStartsAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(row.furthestBookedSessionStartsAt)}
                      </TableCell>
                      <TableCell>
                        <ComplianceStatusBadge tone="bad">
                          Non-compliant
                        </ComplianceStatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-xs">
                          <Link
                            className="text-primary font-medium underline-offset-4 hover:underline"
                            href={notesForAthleteHref(row.athleteProfileId)}
                          >
                            Athlete / CAP
                          </Link>
                          <Link
                            className="text-primary font-medium underline-offset-4 hover:underline"
                            href={rosterHref}
                          >
                            Roster
                          </Link>
                          <Link
                            className="text-primary font-medium underline-offset-4 hover:underline"
                            href={sessionsHref}
                          >
                            Sessions
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">CAP notes</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Note compliance</CardTitle>
            <CardDescription>
              Athletes without a CAP note for the current UTC week (Monday
              anchor).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {noteIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No note gaps for the current week on the visible roster.
              </p>
            ) : (
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Last CAP note</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noteIssues.map((row) => (
                    <TableRow key={row.athleteId} className={issueRowClass}>
                      <TableCell className="font-medium">
                        {row.athleteFullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(row.lastCapNoteCreatedAt)}
                      </TableCell>
                      <TableCell>
                        <ComplianceStatusBadge tone="bad">
                          Non-compliant
                        </ComplianceStatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-xs">
                          <Link
                            className="text-primary font-medium underline-offset-4 hover:underline"
                            href={notesForAthleteHref(row.athleteProfileId)}
                          >
                            CAP notes
                          </Link>
                          <Link
                            className="text-primary font-medium underline-offset-4 hover:underline"
                            href={rosterHref}
                          >
                            Roster
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">Payment</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment compliance</CardTitle>
            <CardDescription>
              Active memberships not in paid / authorized / waived standing, or a
              positive billing balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No payment issues on the visible roster.
              </p>
            ) : (
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
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
                      <TableRow key={row.athleteId} className={issueRowClass}>
                        <TableCell className="font-medium">
                          {row.athleteFullName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.displayLabel}
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={tone}>{badgeLabel}</StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-xs">
                            <Link
                              className="text-primary font-medium underline-offset-4 hover:underline"
                              href={notesForAthleteHref(row.athleteProfileId)}
                            >
                              Athlete / CAP
                            </Link>
                            <Link
                              className="text-primary font-medium underline-offset-4 hover:underline"
                              href={billingHref}
                            >
                              Billing
                            </Link>
                            <Link
                              className="text-primary font-medium underline-offset-4 hover:underline"
                              href={sessionsHref}
                            >
                              Sessions
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
