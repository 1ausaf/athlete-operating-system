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

const threads = [
  {
    initials: "DC",
    title: "Demo Coach + Demo Athlete",
    preview: "Great work on the tempo deadlifts today. Let's adjust...",
    timestamp: "2h",
    participantCount: 2,
  },
  {
    initials: "FG",
    title: "Demo Coach + Demo Athlete + Guardian",
    preview: "Scheduling next week's check-in - copying your guardian.",
    timestamp: "1d",
    participantCount: 3,
  },
];

export default function AthleteMessagesPage() {
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
          Safe-Sport compliant messaging. All conversations between an adult
          staff member and a minor athlete include a second adult by default.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
            Rule of Two
          </CardTitle>
          <CardDescription>
            A 1:1 direct message between an adult staff member and a minor
            athlete is never allowed. Composing one will prompt you to add a
            second adult (another coach or a guardian) to the thread.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inbox</CardTitle>
          <CardDescription>
            Recent threads. Threads with more than two participants are marked
            with a group icon.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {threads.map((thread, index) => (
            <div key={thread.title}>
              {index > 0 ? <Separator className="my-3" /> : null}
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{thread.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{thread.title}</span>
                    {thread.participantCount > 2 ? (
                      <Users
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {thread.preview}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {thread.timestamp}
                </span>
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-end">
            <Button disabled>Compose</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
