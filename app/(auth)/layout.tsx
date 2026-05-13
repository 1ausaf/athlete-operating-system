import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span
              className="inline-block h-6 w-6 rounded bg-primary"
              aria-hidden
            />
            <span>AOS</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      <footer className="border-t bg-background py-4">
        <div className="mx-auto w-full max-w-6xl px-4 text-center text-xs text-muted-foreground md:px-6">
          Athlete Operating System - Safe-Sport compliant by design
        </div>
      </footer>
    </div>
  );
}
