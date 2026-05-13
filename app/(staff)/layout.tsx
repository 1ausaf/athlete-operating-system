import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { StaffNav } from "@/components/nav/staff-nav";
import { AppShell } from "@/components/shell/app-shell";
import { requireUserWithProfile } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";

export default async function StaffWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  return (
    <AppShell
      user={user}
      workspaceLabel="Staff Workspace"
      nav={<StaffNav user={user} />}
    >
      {children}
    </AppShell>
  );
}
