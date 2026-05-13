import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";

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
import { listThreadsForUser } from "@/lib/data/messaging";
import { isStaff } from "@/lib/rbac";

function initials(title: string): string {
  const parts = title.split(/[,\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase() || "?";
  }
  return (parts[0]?.slice(0, 2) ?? "M").toUpperCase();
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default async function StaffMessagingPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const threads = await listThreadsForUser(user.id);
  const inboxError = searchParams?.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Messaging
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Threads with athletes and families. Rule-of-Two is enforced in the
          database when participants are added.
        </p>
      </div>

      {inboxError ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {inboxError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
            Rule-of-Two
          </CardTitle>
          <CardDescription>
            Threads including a minor require at least two adults. One-to-one
            adult–minor threads are blocked at the database layer.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Threads</CardTitle>
            <CardDescription>Conversations you participate in.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={"/staff/messaging/new" as Route}>New thread</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No threads yet. Start one with athletes from the new thread page.
            </p>
          ) : (
            threads.map((thread, index) => (
              <div key={thread.id}>
                {index > 0 ? <Separator className="my-3" /> : null}
                <Link
                  href={`/staff/messaging/${thread.id}` as Route}
                  className="flex items-start gap-3 rounded-md transition-colors hover:bg-muted/50"
                >
                  <Avatar>
                    <AvatarFallback>{initials(thread.title)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{thread.title}</span>
                      {thread.title.includes(",") ? (
                        <Users
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {thread.lastMessagePreview ??
                        "No messages yet"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatWhen(thread.lastMessageAt ?? thread.createdAt)}
                  </span>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
