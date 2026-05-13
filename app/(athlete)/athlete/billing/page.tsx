import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUserWithProfile } from "@/lib/auth";
import { getBillingStatusForAthlete } from "@/lib/data/billing";
import type { Database } from "@/types/db";

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

export default async function AthleteBillingPage() {
  const user = await requireUserWithProfile();
  if (user.role !== "athlete") {
    redirect("/staff/athletes");
  }

  const billing = await getBillingStatusForAthlete(user.id);

  const balanceDollars = (billing.balanceCents / 100).toFixed(2);
  const nextChargeLabel = billing.nextInvoiceDate ?? "Not scheduled";
  const planLine = billing.planName
    ? `${billing.planName} (${formatFrequency(billing.membershipFrequency)})`
    : "No plan on file";

  const inGoodStanding = !billing.bookingRestricted;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Athlete Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Billing
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Membership, next billing window, and payment standing. A lapsed
          membership or past-due balance can pause booking until resolved.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Open balance</CardDescription>
            <CardTitle className="text-2xl">${balanceDollars}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-1 text-xs text-muted-foreground">
            {billing.balanceCents > 0 ? (
              <>
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                Balance due — update payment to restore booking.
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                No open balance on file.
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Next billing date</CardDescription>
            <CardTitle className="text-xl font-semibold leading-snug md:text-2xl">
              {nextChargeLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Estimated from your plan period when available. Square or Stripe
            will provide exact invoice dates once connected.
            {billing.lastChargeDate ? (
              <p className="mt-2 text-foreground">
                Last charge: {billing.lastChargeDate}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Current plan</CardDescription>
            <CardTitle className="text-base font-medium leading-snug">
              {planLine}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              Billing:{" "}
              <span className="font-medium text-foreground">
                {billing.status === "paid" && "Good standing"}
                {billing.status === "grace_period" && "Authorized (grace)"}
                {billing.status === "pending" && "Payment pending"}
                {billing.status === "overdue" && "Overdue / restricted"}
                {billing.status === "unknown" && "Unknown"}
              </span>
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking impact</CardTitle>
          <CardDescription>
            Booking is gated by membership and payment status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            {inGoodStanding ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 text-foreground"
                aria-hidden
              />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden />
            )}
            {billing.bookingRestricted
              ? "Billing or membership is blocking new bookings until resolved."
              : "Account is in good standing for booking in cadence with your plan."}
          </div>
          {billing.membershipValidFrom ? (
            <p className="text-xs">
              Membership window:{" "}
              {new Date(billing.membershipValidFrom).toLocaleDateString()}
              {billing.membershipValidTo
                ? ` – ${new Date(billing.membershipValidTo).toLocaleDateString()}`
                : " – open-ended"}
            </p>
          ) : null}
          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {/* TODO: Square / Stripe customer portal — replace disabled buttons */}
            <Button disabled variant="outline">
              Update payment method
            </Button>
            <Button disabled variant="outline">
              View invoices
            </Button>
            <Button asChild variant="ghost" size="sm" className="sm:ml-0">
              <Link href={"/athlete/dashboard" as Route}>Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
