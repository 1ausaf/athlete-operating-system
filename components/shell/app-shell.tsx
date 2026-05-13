import Link from "next/link";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AppUser } from "@/types/user";

export interface AppShellProps {
  /** Sidebar contents (role-specific nav). */
  nav: ReactNode;
  /** The authenticated user; used to show identity in the top bar. */
  user: AppUser;
  /** A short context label rendered next to the brand (e.g. "Athlete Portal"). */
  workspaceLabel: string;
  children: ReactNode;
}

/**
 * App shell: fixed sidebar on `md+`, drawer sheet on mobile, sticky top bar,
 * and a scrollable main content area. Layout-only; auth + role gating happens
 * in the parent route-group layout.
 */
export function AppShell({
  nav,
  user,
  workspaceLabel,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            {nav}
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded bg-primary" aria-hidden />
          <span>AOS</span>
        </Link>

        <Separator orientation="vertical" className="hidden h-6 md:block" />
        <span className="hidden text-sm text-muted-foreground md:inline">
          {workspaceLabel}
        </span>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r md:block">{nav}</aside>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
