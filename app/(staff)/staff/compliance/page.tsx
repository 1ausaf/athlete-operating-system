import { CalendarRange, CreditCard, NotebookPen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ComplianceCard {
  icon: LucideIcon;
  title: string;
  metric: string;
  description: string;
  bullets: string[];
}

const dashboards: ComplianceCard[] = [
  {
    icon: CalendarRange,
    title: "Booking",
    metric: "94%",
    description: "Sessions booked within membership cadence.",
    bullets: [
      "3 athletes over their weekly frequency cap",
      "2 no-shows in the last 7 days",
      "1 athlete with zero bookings in 14 days",
    ],
  },
  {
    icon: NotebookPen,
    title: "Notes",
    metric: "86%",
    description: "CAP notes published within the 24-hour SLA.",
    bullets: [
      "4 sessions missing a CAP note (overdue)",
      "Average time-to-publish: 9 hours",
      "0 unpublished drafts older than 48 hours",
    ],
  },
  {
    icon: CreditCard,
    title: "Payment",
    metric: "98%",
    description: "Active memberships with a current payment method.",
    bullets: [
      "2 past-due balances",
      "3 memberships lapsing in the next 7 days",
      "1 booking auto-paused for failed charge",
    ],
  },
];

export default function StaffCompliancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Compliance
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Three dashboards - booking, notes, payment - surfacing gaps before
          they become problems. Each card drills into its full view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {dashboards.map(({ icon: Icon, title, metric, description, bullets }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <span className="text-3xl font-semibold tracking-tight">
                {metric}
              </span>
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
