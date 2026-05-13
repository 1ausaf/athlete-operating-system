import Link from "next/link";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserWithProfile } from "@/lib/auth";
import {
  getBillingStatusForAthlete,
  type BillingStatus,
} from "@/lib/data/billing";
import { getAthleteProgramSummary } from "@/lib/data/programs";
import type { StatusTone } from "@/lib/data/booking-status-labels";
import { isStaff } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Database } from "@/types/db";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MembershipFrequency =
  Database["public"]["Enums"]["membership_frequency"];

function formatFrequency(freq: MembershipFrequency | null): string {
  if (!freq) return "—";
  switch (freq) {
    case "unlimited":
      return "Unlimited";
    case "per_week":
      return "Per week";
    case "per_two_weeks":
      return "Per two weeks";
    case "per_month":
      return "Per month";
    case "package":
      return "Package";
    default:
      return freq;
  }
}

function billingDisplayTone(status: BillingStatus["status"]): StatusTone {
  switch (status) {
    case "paid":
      return "ok";
    case "grace_period":
      return "warn";
    case "pending":
      return "warn";
    case "overdue":
      return "bad";
    case "unknown":
      return "neutral";
    default:
      return "neutral";
  }
}

export default async function StaffAthleteDetailPage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const { athleteId } = await params;
  if (!UUID_RE.test(athleteId)) {
    notFound();
  }

  const supabase = createSupabaseServerClient();
  const { data: athleteRaw, error } = await supabase
    .from("athletes")
    .select(
      `
      id,
      profile_id,
      injury_flag,
      profiles (
        full_name
      )
    `,
    )
    .eq("id", athleteId)
    .maybeSingle();

  if (error || !athleteRaw) {
    notFound();
  }

  type AthleteRow = {
    id: string;
    profile_id: string;
    injury_flag: boolean;
    profiles:
      | { full_name: string | null }
      | { full_name: string | null }[]
      | null;
  };

  const athlete = athleteRaw as AthleteRow;
  const p = athlete.profiles;
  const prof = Array.isArray(p) ? p[0] : p;
  const fullName = prof?.full_name?.trim() || "Unknown athlete";

  const billing = await getBillingStatusForAthlete(athlete.profile_id);
  const programSummary = await getAthleteProgramSummary(athlete.profile_id);
  const tone = billingDisplayTone(billing.status);

  const rosterHref = "/staff/athletes" as Route;
  const programDetailHref =
    `/staff/athletes/${athlete.id}/program` as Route;

  const lastSessionLabel = programSummary.lastCompletedSessionDate
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(programSummary.lastCompletedSessionDate))
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Button asChild variant="ghost" size="sm" className="w-fit px-0">
          <Link href={rosterHref}>
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Athletes
          </Link>
        </Button>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {fullName}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Athlete id {athlete.id}
          {athlete.injury_flag ? " · Injury flag on file" : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Program</CardTitle>
          <CardDescription>
            Current assignment and next program day (completion-based proxy
            until native programming).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="font-medium">Program: </span>
            {programSummary.programName ?? "—"}
          </p>
          <p>
            <span className="font-medium">Next program day: </span>
            {programSummary.programId && programSummary.currentDay != null
              ? `Day ${programSummary.currentDay}`
              : "—"}
          </p>
          <p>
            <span className="font-medium">Last completed session: </span>
            {lastSessionLabel ?? "—"}
          </p>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href={programDetailHref}>View program days</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
          <CardDescription>
            Same membership and payment snapshot the athlete sees on their
            billing page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={tone}>
              {billing.bookingRestricted
                ? "Needs attention / restricted"
                : "Good standing"}
            </StatusBadge>
            <span className="text-muted-foreground">({billing.status})</span>
          </div>
          <p>
            <span className="font-medium">Plan: </span>
            {billing.planName ?? "—"} (
            {formatFrequency(billing.membershipFrequency)})
          </p>
          <p>
            <span className="font-medium">Next billing (estimate): </span>
            {billing.nextInvoiceDate ?? "—"}
          </p>
          {billing.lastChargeDate ? (
            <p>
              <span className="font-medium">Last charge: </span>
              {billing.lastChargeDate}
            </p>
          ) : null}
          {billing.balanceCents > 0 ? (
            <p>
              <span className="font-medium">Balance: </span>$
              {(billing.balanceCents / 100).toFixed(2)}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
