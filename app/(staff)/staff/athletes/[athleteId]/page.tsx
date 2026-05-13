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
import type { BillingDisplayStatus } from "@/lib/data/memberships";
import { getBillingStatusForAthlete } from "@/lib/data/memberships";
import type { StatusTone } from "@/lib/data/booking-status-labels";
import { isStaff } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { statusToneToBadgeClass } from "@/lib/ui/status";
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

function billingDisplayTone(status: BillingDisplayStatus): StatusTone {
  switch (status) {
    case "paid":
      return "ok";
    case "grace_period":
      return "warn";
    case "overdue":
      return "bad";
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
  const tone = billingDisplayTone(billing.displayStatus);
  const badgeClass = statusToneToBadgeClass(tone);

  const rosterHref = "/staff/athletes" as Route;

  return (
    <div className="flex flex-col gap-6">
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
          <CardTitle className="text-base">Billing</CardTitle>
          <CardDescription>
            Same membership and payment snapshot the athlete sees on their
            billing page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={badgeClass}>
              {billing.bookingRestricted
                ? "Payment-restricted"
                : "Good standing"}
            </span>
            <span className="text-muted-foreground">
              ({billing.displayStatus})
            </span>
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
