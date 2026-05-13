import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

function initials(title: string): string {
  const parts = title.split(/[,\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase() || "?";
  }
  return (parts[0]?.slice(0, 2) ?? "M").toUpperCase();
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AthleteMessagesPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const user = await requireUserWithProfile();
  if (user.role !== "athlete") {
    redirect("/staff/athletes");
  }

  const threads = await listThreadsForUser(user.id);
  const inboxError = searchParams?.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Athlete Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Messages
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Safe-Sport compliant messaging. Rule-of-Two is enforced when thread
          membership is set.
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
            Rule of Two
          </CardTitle>
          <CardDescription>
            Threads with minors require at least two adults. One-to-one
            adult–minor threads are not allowed.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inbox</CardTitle>
          <CardDescription>Your conversations.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. When staff add you to a thread, it will appear
              here.
            </p>
          ) : (
            threads.map((thread, index) => (
              <div key={thread.id}>
                {index > 0 ? <Separator className="my-3" /> : null}
                <Link
                  href={`/athlete/messages/${thread.id}` as Route}
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
                      {thread.lastMessagePreview ?? "No messages yet"}
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
