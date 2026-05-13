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
    initials: "DA",
    title: "Demo Athlete + Demo Coach",
    preview: "Sent CAP focus for tomorrow. Confirming attendance.",
    timestamp: "2h",
    participantCount: 2,
    minorAdjacent: false,
  },
  {
    initials: "S2",
    title: "Sample Athlete Two + Demo Coach + Guardian",
    preview: "Copying guardian per Rule-of-Two. Game film attached.",
    timestamp: "5h",
    participantCount: 3,
    minorAdjacent: true,
  },
  {
    initials: "S3",
    title: "Sample Athlete Three + Demo Coach",
    preview: "Payment reminder ack - card update incoming.",
    timestamp: "1d",
    participantCount: 2,
    minorAdjacent: false,
  },
];

export default function StaffMessagingPage() {
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
          Threads with athletes and families. Composing a 1:1 with a minor is
          blocked - the UI prompts you to add a second adult before send.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
            Rule-of-Two guardrail
          </CardTitle>
          <CardDescription>
            Every minor-adjacent thread must include a second adult (another
            coach or a guardian). canMessageDirectly() runs at compose time and
            again on the server.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Threads</CardTitle>
          <CardDescription>
            Minor-adjacent threads are marked with a group icon for quick
            triage.
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
                    {thread.minorAdjacent ? (
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
            <Button disabled>New thread</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
