import {
  CalendarDays,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  MessagesSquare,
} from "lucide-react";

import { canViewBilling } from "@/lib/rbac";
import type { AppUser } from "@/types/user";

import { ShellNav, type ShellNavItem } from "./shell-nav";

export function AthleteNav({ user }: { user: AppUser }) {
  const items: ShellNavItem[] = [
    { href: "/athlete/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/athlete/sessions", label: "Sessions", icon: CalendarDays },
    { href: "/athlete/training", label: "Training", icon: Dumbbell },
    { href: "/athlete/messages", label: "Messages", icon: MessagesSquare },
  ];

  if (canViewBilling(user)) {
    items.push({ href: "/athlete/billing", label: "Billing", icon: CreditCard });
  }

  return (
    <ShellNav
      title="Athlete Portal"
      subtitle={user.fullName}
      items={items}
    />
  );
}
