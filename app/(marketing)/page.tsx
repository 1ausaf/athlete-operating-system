import Link from "next/link";
import { ArrowRight, CalendarCheck2, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Unified athlete profiles",
    description:
      "One source of truth for membership, history, and CAP notes - shared between athletes and staff.",
  },
  {
    icon: CalendarCheck2,
    title: "Frequency-aware booking",
    description:
      "Sessions honor membership cadence and payment status before they ever hit the calendar.",
  },
  {
    icon: ShieldCheck,
    title: "Safe-Sport messaging",
    description:
      "Rule-of-Two enforcement keeps every adult-minor conversation appropriately staffed.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6">
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Athlete Operating System
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          The operating system for a semi-private coaching facility.
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Unified profiles, membership-aware booking, CAP notes, compliance
          dashboards, and Safe-Sport messaging - in one place, with role-based
          access for athletes, coaches, admins, and owners.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/athlete/dashboard">
              Open Athlete Portal
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/staff/athletes">Open Staff Workspace</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  );
}
