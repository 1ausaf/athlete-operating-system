import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
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
import { requireUserWithProfile } from "@/lib/auth";
import { fetchStaffAthleteComplianceRoster } from "@/lib/data/compliance";
import { isStaff } from "@/lib/rbac";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export default async function StaffAthletesPage() {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const roster = await fetchStaffAthleteComplianceRoster();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Athletes
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Roster of athletes you coach or oversee under RLS. Open a profile for
          billing snapshot and future CAP and session drill-down.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
            Roster
          </CardTitle>
          <CardDescription>
            {roster.length === 0
              ? "No athletes visible for your account."
              : `${roster.length} athlete${roster.length === 1 ? "" : "s"}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {roster.map((row, index) => {
            const name = row.profiles
              ? Array.isArray(row.profiles)
                ? row.profiles[0]?.full_name?.trim()
                : row.profiles.full_name?.trim()
              : null;
            const display = name || "Unknown athlete";
            const profileHref = `/staff/athletes/${row.id}` as Route;

            return (
              <div key={row.id}>
                {index > 0 ? <Separator className="my-3" /> : null}
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{initials(display)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{display}</span>
                    <p className="text-xs text-muted-foreground">
                      Minor messaging rules apply when date of birth indicates
                      under 18.
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldAlert className="h-3 w-3" aria-hidden />
                      Rule-of-Two applies in threads with minors.
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={profileHref}>Open profile</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
