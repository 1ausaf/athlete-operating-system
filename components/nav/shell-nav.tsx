"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ShellNavItem {
  href: Route;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

export interface ShellNavProps {
  title: string;
  subtitle?: string;
  items: ShellNavItem[];
}

/**
 * Generic sidebar nav used by both the athlete portal and staff workspace.
 * Role-specific filtering happens in the calling component before items are
 * passed in (see `AthleteNav` / `StaffNav`).
 */
export function ShellNav({ title, subtitle, items }: ShellNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex h-full flex-col gap-6 p-6"
      aria-label={`${title} navigation`}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground/80">{subtitle}</p>
        ) : null}
      </div>

      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
