import Link from "next/link";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

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
import { getThreadWithMessages } from "@/lib/data/messaging";
import { isStaff } from "@/lib/rbac";

import { sendStaffThreadMessage } from "../actions";

function formatTs(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function StaffThreadPage({
  params,
  searchParams,
}: {
  params: { threadId: string };
  searchParams?: { error?: string };
}) {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const detail = await getThreadWithMessages(params.threadId, user.id);
  if (!detail) notFound();

  const err = searchParams?.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={"/staff/messaging" as Route}>← Inbox</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Conversation
        </h1>
        <p className="text-xs text-muted-foreground">
          Started {formatTs(detail.createdAt)}
        </p>
      </div>

      {err ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Messages</CardTitle>
          <CardDescription>
            Rule-of-Two is enforced when thread membership changes; sending
            requires you to be a participant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {detail.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            detail.messages.map((m, i) => (
              <div key={`${m.createdAt}-${i}`}>
                {i > 0 ? <Separator className="my-3" /> : null}
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{m.senderName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTs(m.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={sendStaffThreadMessage} className="flex flex-col gap-3">
            <input type="hidden" name="threadId" value={detail.id} />
            <textarea
              name="body"
              rows={4}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Write a message…"
            />
            <div className="flex justify-end">
              <Button type="submit">Send</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
