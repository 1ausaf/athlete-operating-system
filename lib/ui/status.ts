import type { StatusTone } from "@/lib/data/booking-status-labels";

const badgeBase =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

/**
 * Tailwind classes for roster-style status pills (booking / payment).
 */
export function statusToneToBadgeClass(tone: StatusTone): string {
  switch (tone) {
    case "ok":
      return `${badgeBase} bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200`;
    case "warn":
      return `${badgeBase} bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100`;
    case "bad":
      return `${badgeBase} bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200`;
    default:
      return `${badgeBase} bg-muted text-muted-foreground`;
  }
}

/** Compliance dashboard: binary compliant vs gap / issue. */
export function complianceToneToBadgeClass(
  tone: "ok" | "bad" | "neutral",
): string {
  switch (tone) {
    case "ok":
      return `${badgeBase} bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200`;
    case "bad":
      return `${badgeBase} bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200`;
    default:
      return `${badgeBase} bg-muted text-muted-foreground`;
  }
}
