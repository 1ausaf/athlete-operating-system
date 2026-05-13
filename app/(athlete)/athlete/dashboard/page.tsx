import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Dumbbell,
  MessagesSquare,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserWithProfile } from "@/lib/auth";
import { getAthleteDashboardData } from "@/lib/data/athlete-dashboard";
import type { BillingDisplayStatus } from "@/lib/data/memberships";
import type { Database } from "@/types/db";

type MembershipFrequency =
  Database["public"]["Enums"]["membership_frequency"];

function formatSessionRange(startsAt: string, endsAt: string): string {
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

function financialSummaryLine(
  status: BillingDisplayStatus,
  nextInvoice: string | null,
): string {
  if (status === "paid") {
    return nextInvoice
      ? `In good standing — next period ${nextInvoice}.`
      : "In good standing.";
  }
  if (status === "grace_period") {
    return "Payment pending — resolve before access is limited.";
  }
  return "Overdue or blocked — booking may be paused until billing is updated.";
}

export default async function AthleteDashboardPage() {
  const user = await requireUserWithProfile();
  if (user.role !== "athlete") {
    redirect("/staff/athletes");
  }

  const data = await getAthleteDashboardData(user.id);

  const messagesHref = "/athlete/messages" as Route;
  const sessionsHref = "/athlete/sessions" as Route;
  const trainingHref = "/athlete/training" as Route;
  const billingHref = "/athlete/billing" as Route;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Athlete Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Today
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          What matters first: messages, upcoming sessions, training, financial
          status, then PRs and accolades.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        <li>
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
                aria-hidden
              >
                1
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MessagesSquare
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle className="text-base">Messages</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  {data.unreadMessages.unreadCount === 0
                    ? "No new replies from others in your threads."
                    : `${data.unreadMessages.unreadCount} thread${data.unreadMessages.unreadCount === 1 ? "" : "s"} with new activity from others.`}
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={messagesHref}>
                  Open inbox
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 pl-11 text-sm">
              {data.unreadMessages.latestUnread.length === 0 ? (
                <p className="text-muted-foreground">You are all caught up.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.unreadMessages.latestUnread.map((m) => (
                    <li key={m.threadId}>
                      <Link
                        href={`/athlete/messages/${m.threadId}` as Route}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        <span className="text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          :{" "}
                        </span>
                        {m.snippet}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </li>

        <li>
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
                aria-hidden
              >
                2
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle className="text-base">Upcoming sessions</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Your next booked sessions (confirmed or waitlisted).
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={sessionsHref}>
                  View schedule
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 pl-11 text-sm">
              {data.upcomingSessions.length === 0 ? (
                <p className="text-muted-foreground">
                  No upcoming bookings. Book a session from the schedule.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.upcomingSessions.map((s) => (
                    <li key={s.sessionId}>
                      <Link
                        href={sessionsHref}
                        className="block text-foreground underline-offset-4 hover:underline"
                      >
                        <span className="font-medium">
                          {formatSessionRange(s.startsAt, s.endsAt)}
                        </span>
                        {s.location ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {s.location}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </li>

        <li>
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
                aria-hidden
              >
                3
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Dumbbell
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle className="text-base">Training program</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  {data.currentProgramSummary.programName
                    ? `Current block: ${data.currentProgramSummary.programName}.`
                    : "No program assigned in AOS yet."}{" "}
                  Day or phase detail may live in TrainHeroic until it is modeled
                  here.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={trainingHref}>
                  Open training
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pl-11" />
          </Card>
        </li>

        <li>
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
                aria-hidden
              >
                4
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle className="text-base">Financial status</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  {financialSummaryLine(
                    data.financialStatus.displayStatus,
                    data.financialStatus.nextInvoiceDate,
                  )}
                  {data.financialStatus.planName ? (
                    <>
                      {" "}
                      Plan: {data.financialStatus.planName} (
                      {formatFrequency(data.financialStatus.membershipFrequency)}
                      ).
                    </>
                  ) : null}
                  {data.financialStatus.balanceCents > 0 ? (
                    <>
                      {" "}
                      Balance due: $
                      {(data.financialStatus.balanceCents / 100).toFixed(2)}.
                    </>
                  ) : null}
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={billingHref}>
                  View billing
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pl-11" />
          </Card>
        </li>

        <li>
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
                aria-hidden
              >
                5
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Trophy
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle className="text-base">PRs and accolades</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Recent wins will appear here once the PRs feed is connected.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pl-11 text-sm text-muted-foreground">
              {data.recentPRsOrAccolades.length === 0
                ? "No entries yet."
                : data.recentPRsOrAccolades.join(" · ")}
            </CardContent>
          </Card>
        </li>
      </ol>
    </div>
  );
}
