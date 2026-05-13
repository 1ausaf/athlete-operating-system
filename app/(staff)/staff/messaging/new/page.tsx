import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserWithProfile } from "@/lib/auth";
import { listAthletesForStaffMessaging } from "@/lib/data/messaging";
import { isStaff } from "@/lib/rbac";

import { NewThreadForm } from "./new-thread-form";

export default async function StaffNewMessagingPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const athletes = await listAthletesForStaffMessaging();
  const err = searchParams?.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={"/staff/messaging" as Route}>← Inbox</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Start new conversation
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Select athletes and, when a minor is included, add another adult by
          profile UUID. The database validates Rule-of-Two when the thread is
          created.
        </p>
      </div>

      {err ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participants</CardTitle>
          <CardDescription>
            You are always included. Pick athletes, then add guardian or second
            coach UUIDs when required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewThreadForm athletes={athletes} />
        </CardContent>
      </Card>
    </div>
  );
}
