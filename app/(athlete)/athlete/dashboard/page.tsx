import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Dumbbell,
  MessagesSquare,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PriorityCard {
  icon: LucideIcon;
  title: string;
  summary: string;
  href?: Route;
  cta?: string;
}

/**
 * Athlete dashboard priority order (per product spec):
 *   1. Messages
 *   2. Upcoming sessions
 *   3. Training
 *   4. Financial status
 *   5. PRs
 */
const priorities: PriorityCard[] = [
  {
    icon: MessagesSquare,
    title: "Messages",
    summary: "1 new message from your coach. Safe-Sport threads are audited.",
    href: "/athlete/messages",
    cta: "Open inbox",
  },
  {
    icon: CalendarDays,
    title: "Upcoming sessions",
    summary: "Next: Tomorrow 4:00 PM - Semi-private strength block.",
    href: "/athlete/sessions",
    cta: "View schedule",
  },
  {
    icon: Dumbbell,
    title: "Training",
    summary: "Week 3 of strength block - today is upper hinge focus.",
    href: "/athlete/training",
    cta: "Open training",
  },
  {
    icon: CreditCard,
    title: "Financial status",
    summary: "Membership active - next charge in 12 days. No outstanding balance.",
    href: "/athlete/billing",
    cta: "View billing",
  },
  {
    icon: Trophy,
    title: "PRs",
    summary: "Trap-bar deadlift 365 lb - new PR set 6 days ago.",
  },
];

export default function AthleteDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Athlete Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Today
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          What matters first, in order: messages, upcoming sessions, training,
          financial status, then PRs.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {priorities.map(({ icon: Icon, title, summary, href, cta }, index) => (
          <li key={title}>
            <Card>
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <span
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden
                    />
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">{summary}</CardDescription>
                </div>
                {href && cta ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={href}>
                      {cta}
                      <ArrowRight className="h-3 w-3" aria-hidden />
                    </Link>
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent />
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
