import {
  CalendarRange,
  CreditCard,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  Users,
} from "lucide-react";

import { canManageMemberships, canViewBilling } from "@/lib/rbac";
import type { AppUser } from "@/types/user";

import { ShellNav, type ShellNavItem } from "./shell-nav";

export function StaffNav({ user }: { user: AppUser }) {
  const items: ShellNavItem[] = [
    { href: "/staff/athletes", label: "Athletes", icon: Users },
    { href: "/staff/sessions", label: "Sessions", icon: CalendarRange },
    { href: "/staff/notes", label: "CAP Notes", icon: NotebookPen },
    { href: "/staff/messaging", label: "Messaging", icon: MessagesSquare },
    { href: "/staff/compliance", label: "Compliance", icon: ShieldCheck },
  ];

  if (canViewBilling(user) || canManageMemberships(user)) {
    items.push({ href: "/staff/billing", label: "Billing", icon: CreditCard });
  }

  return (
    <ShellNav
      title="Staff Workspace"
      subtitle={`${user.fullName} - ${user.role}`}
      items={items}
    />
  );
}
