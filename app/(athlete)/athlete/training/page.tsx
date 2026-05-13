import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, LayoutDashboard } from "lucide-react";

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
  buildProgramDayListItems,
  getAthleteProgramSummary,
} from "@/lib/data/programs";

function formatSessionDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function AthleteTrainingPage() {
  const user = await requireUserWithProfile();
  if (user.role !== "athlete") {
    redirect("/staff/athletes");
  }

  const summary = await getAthleteProgramSummary(user.id);
  const programDays = buildProgramDayListItems(summary);

  const dashboardHref = "/athlete/dashboard" as Route;
  const sessionsHref = "/athlete/sessions" as Route;

  const nextDay = summary.currentDay ?? 1;
  const lastDone = formatSessionDate(summary.lastCompletedSessionDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Athlete Portal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Training
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            You advance to the next program day when you complete and staff log
            your session — not automatically the next calendar day. Detailed
            exercise prescriptions will appear here once native programming or
            TrainHeroic sync is connected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={dashboardHref}>
              <LayoutDashboard className="mr-1 h-4 w-4" aria-hidden />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={sessionsHref}>
              <CalendarDays className="mr-1 h-4 w-4" aria-hidden />
              Sessions
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current program</CardTitle>
          <CardDescription>
            {summary.programName
              ? "Assigned program in AOS."
              : "No program assigned in AOS yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-foreground">Program: </span>
            {summary.programName ?? "—"}
          </p>
          <p>
            <span className="font-medium text-foreground">Next program day: </span>
            {summary.programId ? `Day ${nextDay}` : "—"}
          </p>
          <p>
            <span className="font-medium text-foreground">Phase: </span>
            {summary.currentPhase ??
              "Not tracked in AOS yet (TrainHeroic / future phases)."}
          </p>
          {lastDone ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Last completed session:{" "}
              </span>
              {lastDone}
            </p>
          ) : summary.programId ? (
            <p className="text-muted-foreground">
              No completed in-facility sessions linked to this program yet.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Program days
        </h2>
        {programDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            When a program is assigned, recent and upcoming days will list here.
            {/* TODO: Exercise blocks per day from native module or TrainHeroic. */}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {programDays.map((d) => {
              const isNext = d.dayNumber === nextDay && summary.programId;
              return (
                <li key={d.dayNumber}>
                  <Card
                    className={
                      isNext
                        ? "border-primary/50 bg-primary/5"
                        : undefined
                    }
                  >
                    <CardHeader className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-sm font-medium">
                          {d.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          {d.isCompleted ? (
                            <span className="text-xs font-medium text-muted-foreground">
                              Completed
                            </span>
                          ) : null}
                          {isNext ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              Next
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {d.isCompleted
                          ? "Logged when your completed session is recorded against this program."
                          : isNext
                            ? "Complete this session to move to the following day."
                            : "Upcoming — prescriptions to follow."}
                        {/* TODO: Per-exercise prescription UI. */}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Back to dashboard
        </Link>
        <span className="mx-2">·</span>
        <Link
          href={sessionsHref}
          className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
        >
          Book and view sessions
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </p>
    </div>
  );
}
