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
  buildProgramDayListItems,
  getAthleteProgramSummary,
} from "@/lib/data/programs";
import { isStaff } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function StaffAthleteProgramPage({
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
    .select("id, profile_id")
    .eq("id", athleteId)
    .maybeSingle();

  if (error || !athleteRaw) {
    notFound();
  }

  const athlete = athleteRaw as { id: string; profile_id: string };

  const summary = await getAthleteProgramSummary(athlete.profile_id);
  const programDays = buildProgramDayListItems(summary);
  const nextDay = summary.currentDay ?? 1;

  const athleteHref = `/staff/athletes/${athlete.id}` as Route;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Button asChild variant="ghost" size="sm" className="w-fit px-0">
          <Link href={athleteHref}>
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Athlete profile
          </Link>
        </Button>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Program (read-only)
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Same completion-based day list the athlete sees. Advancement follows
          logged sessions, not the calendar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
          <CardDescription>Current assignment for this athlete.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Program: </span>
            {summary.programName ?? "—"}
          </p>
          <p>
            <span className="font-medium">Next program day: </span>
            {summary.programId ? `Day ${nextDay}` : "—"}
          </p>
          <p>
            <span className="font-medium">Phase: </span>
            {summary.currentPhase ?? "—"}
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Program days
        </h2>
        {programDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No program assigned in AOS for this athlete.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {programDays.map((d) => {
              const isNext = d.dayNumber === nextDay && summary.programId;
              return (
                <li key={d.dayNumber}>
                  <Card
                    className={
                      isNext ? "border-primary/50 bg-primary/5" : undefined
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
                        Read-only coach view. Detailed prescriptions TODO
                        (TrainHeroic / native module).
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
