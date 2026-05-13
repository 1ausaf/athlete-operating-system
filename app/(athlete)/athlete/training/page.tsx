import { ArrowRight, Dumbbell, Target, Timer, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const blocks = [
  {
    icon: Target,
    title: "Today's session",
    detail:
      "Upper hinge focus. Trap-bar deadlift 3x5 then accessory pull volume.",
  },
  {
    icon: Dumbbell,
    title: "Program of the week",
    detail:
      "Week 3 of 6 - strength block. RPE-capped lifts with conditioning on off days.",
  },
  {
    icon: Trophy,
    title: "PR ladder",
    detail:
      "Squat, bench, deadlift, vertical, broad jump - current bests with next-step targets.",
  },
  {
    icon: Timer,
    title: "Conditioning",
    detail:
      "Two assigned conditioning blocks (zone-2 + 10-min finisher) with target durations.",
  },
];

export default function AthleteTrainingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Athlete Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Training
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          What you are working on, in priority order. Programming is written by
          your coach inside the staff workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map(({ icon: Icon, title, detail }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{detail}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                Full view coming soon
                <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
