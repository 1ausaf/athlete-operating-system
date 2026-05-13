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
import { Separator } from "@/components/ui/separator";
import { requireUserWithProfile } from "@/lib/auth";
import { getAthleteDashboardData } from "@/lib/data/athlete-dashboard";
import type { BillingStatus } from "@/lib/data/billing";
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
  status: BillingStatus["status"],
  nextInvoice: string | null | undefined,
): string {
  if (status === "paid") {
    return nextInvoice
      ? `In good standing — next period ${nextInvoice}.`
      : "In good standing.";
  }
  if (status === "grace_period") {
    return "Payment authorized — resolve any balance before access is limited.";
  }
  if (status === "pending") {
    return "Payment pending — booking may be limited until the charge completes.";
  }
  if (status === "unknown") {
    return "No active billing snapshot on file — contact staff if this looks wrong.";
  }
  return "Overdue or blocked — booking is paused until billing is updated.";
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
    <div className="flex flex-col gap-4">
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
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-0">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <MessagesSquare
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">Messages</CardTitle>
                  <CardDescription className="mt-1">
                    {data.unreadMessages.unreadCount === 0
                      ? "No new replies from others in your threads."
                      : `${data.unreadMessages.unreadCount} thread${data.unreadMessages.unreadCount === 1 ? "" : "s"} with new activity from others.`}
                  </CardDescription>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={messagesHref}>
                  Open inbox
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent className="space-y-2 pt-0 text-sm">
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
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-0">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <CalendarDays
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">Upcoming sessions</CardTitle>
                  <CardDescription className="mt-1">
                    Your next booked sessions (confirmed or waitlisted).
                  </CardDescription>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={sessionsHref}>
                  View schedule
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent className="space-y-2 pt-0 text-sm">
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
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-0">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Dumbbell
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">Training program</CardTitle>
                  <CardDescription className="mt-1">
                  {data.currentProgramSummary.programName ? (
                    <>
                      <span className="font-medium text-foreground">
                        {data.currentProgramSummary.programName}
                      </span>
                      {data.currentProgramSummary.programId &&
                      data.currentProgramSummary.currentDay != null ? (
                        <>
                          {" "}
                          · Next day: {data.currentProgramSummary.currentDay}
                        </>
                      ) : null}
                      {data.currentProgramSummary.currentPhase ? (
                        <>
                          {" "}
                          · Phase: {data.currentProgramSummary.currentPhase}
                        </>
                      ) : null}
                      . You advance when completed sessions are logged, not by
                      the calendar alone.
                    </>
                  ) : (
                    "No program assigned in AOS yet."
                  )}
                </CardDescription>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={trainingHref}>
                  Open training
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent className="space-y-1 pt-0 text-sm text-muted-foreground">
              {data.currentProgramSummary.lastCompletedSessionDate ? (
                <p>
                  Last completed session:{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }).format(
                    new Date(data.currentProgramSummary.lastCompletedSessionDate),
                  )}
                </p>
              ) : data.currentProgramSummary.programId ? (
                <p>No completed sessions linked to this program yet.</p>
              ) : null}
              {!data.currentProgramSummary.currentPhase &&
              data.currentProgramSummary.programName ? (
                <p>Phase is not tracked in AOS yet (TrainHeroic / future model).</p>
              ) : null}
            </CardContent>
          </Card>
        </li>

        <li>
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-0">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <CreditCard
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">Financial status</CardTitle>
                  <CardDescription className="mt-1">
                    {financialSummaryLine(
                      data.financialStatus.status,
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
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={billingHref}>
                  View billing
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent className="pt-0 text-sm text-muted-foreground">
              <p>Use billing for receipts, payment methods, and plan changes.</p>
            </CardContent>
          </Card>
        </li>

        <li>
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-0">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Trophy
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">PRs and accolades</CardTitle>
                  <CardDescription className="mt-1">
                    Recent wins will appear here once the PRs feed is connected.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent className="pt-0 text-sm text-muted-foreground">
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
