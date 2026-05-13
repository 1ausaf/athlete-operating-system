import { ShieldAlert, Users } from "lucide-react";

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

const segments = [
  { label: "Active", count: 42 },
  { label: "Trial", count: 6 },
  { label: "Lapsed", count: 3 },
  { label: "Minors (guardian required)", count: 18 },
];

const roster = [
  {
    initials: "DA",
    name: "Demo Athlete",
    detail: "Semi-private 3x - membership active",
    flag: null as string | null,
  },
  {
    initials: "SA",
    name: "Sample Athlete Two",
    detail: "Return-to-play week 2",
    flag: "Minor - guardian on thread",
  },
  {
    initials: "S3",
    name: "Sample Athlete Three",
    detail: "Speed primer block",
    flag: "Membership lapses in 4 days",
  },
];

export default function StaffAthletesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Athletes
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Roster of athletes you coach or oversee. Minors are flagged so
          Rule-of-Two guardrails fire in messaging and check-in.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {segments.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-2xl">{s.count}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
            Roster
          </CardTitle>
          <CardDescription>
            Drill into a profile for CAP notes, sessions, and family contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {roster.map((row, index) => (
            <div key={row.name}>
              {index > 0 ? <Separator className="my-3" /> : null}
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{row.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="text-sm font-medium">{row.name}</span>
                  <p className="text-xs text-muted-foreground">{row.detail}</p>
                  {row.flag ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldAlert className="h-3 w-3" aria-hidden />
                      {row.flag}
                    </p>
                  ) : null}
                </div>
                <Button variant="ghost" size="sm" disabled>
                  Open profile
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
