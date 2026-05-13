import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span
              className="inline-block h-6 w-6 rounded bg-primary"
              aria-hidden
            />
            <span>AOS</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-4 text-sm text-muted-foreground md:flex">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href={"/style-guide" as Route} className="hover:text-foreground">
              Style guide
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/athlete/dashboard">Athlete Portal</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/staff/athletes">Staff Workspace</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
          {children}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <span>(c) {new Date().getFullYear()} Athlete Operating System</span>
          <span>Safe-Sport compliant by design</span>
        </div>
      </footer>
    </div>
  );
}
