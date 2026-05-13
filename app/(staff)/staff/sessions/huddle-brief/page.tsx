import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface HuddleRow {
  name: string;
  initials: string;
  focus: string;
  pr?: string;
  loadFlag?: string;
  familyNote?: string;
  paymentFlag?: string;
}

const rows: HuddleRow[] = [
  {
    name: "Demo Athlete",
    initials: "DA",
    focus: "Upper hinge - tempo emphasis. Watch right scap dyskinesis.",
    pr: "Trap-bar DL 365 last block",
    loadFlag: "RPE 8.5 cap today",
  },
  {
    name: "Sample Athlete Two",
    initials: "SA",
    focus: "Return-to-play week 2. Bilateral landings only.",
    familyNote: "Parent requested a check-in after session.",
  },
  {
    name: "Sample Athlete Three",
    initials: "S3",
    focus: "Speed primer. Block clearance drills.",
    paymentFlag: "Membership lapses in 4 days",
  },
];

export default function HuddleBriefPage() {
  const sessionsHref = "/staff/sessions" as Route;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Staff Workspace - Sessions
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Huddle brief
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            The 60-second read before you walk on the floor. Latest CAP focus,
            load flags, family notes, and payment warnings for every athlete on
            deck.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={sessionsHref}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to sessions
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next session - 4:00 PM</CardTitle>
          <CardDescription>
            Semi-private block - 3 athletes, 1 coach on deck.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {rows.map((row, index) => (
            <div key={row.name}>
              {index > 0 ? <Separator className="my-4" /> : null}
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{row.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{row.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {row.focus}
                    </span>
                    {row.pr ? (
                      <span className="text-xs text-muted-foreground">
                        Recent PR: {row.pr}
                      </span>
                    ) : null}
                    {row.familyNote ? (
                      <span className="text-xs text-muted-foreground">
                        Family: {row.familyNote}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-1 md:items-end">
                  {row.loadFlag ? (
                    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
                      <AlertTriangle className="h-3 w-3" aria-hidden />
                      {row.loadFlag}
                    </span>
                  ) : null}
                  {row.paymentFlag ? (
                    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
                      <ShieldAlert className="h-3 w-3" aria-hidden />
                      {row.paymentFlag}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Data is mocked - this view will read from the live session + CAP note
        tables once the backend lands.
      </p>
    </div>
  );
}
