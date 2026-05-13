import { getAthleteIdForProfileId } from "@/lib/data/athletes";
import { fourWeekThreshold } from "@/lib/data/compliance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type MembershipRow = Database["public"]["Tables"]["memberships"]["Row"];
type MembershipPlanRow = Database["public"]["Tables"]["membership_plans"]["Row"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];
type MembershipFrequency =
  Database["public"]["Enums"]["membership_frequency"];

const MEMBERSHIP_PLAN_SELECT = `
  membership_plans (
    id,
    name,
    description,
    membership_frequency,
    sessions_allowed_per_period,
    period_days,
    price_cents,
    is_active,
    created_at,
    updated_at
  )
` as const;

function normalizePlan(
  plan: MembershipPlanRow | MembershipPlanRow[] | null,
): MembershipPlanRow | null {
  if (plan == null) return null;
  return Array.isArray(plan) ? plan[0] ?? null : plan;
}

/** Next billing period boundary from anchor + period_days (placeholder until Square/Stripe). */
function estimateNextInvoiceDateIso(
  validFrom: string,
  periodDays: number | null,
): string | null {
  if (periodDays == null || periodDays <= 0) return null;
  const stepMs = periodDays * 86_400_000;
  const now = Date.now();
  let cursor = new Date(validFrom).getTime();
  if (Number.isNaN(cursor)) return null;
  let guard = 0;
  while (cursor < now && guard < 10_000) {
    cursor += stepMs;
    guard += 1;
  }
  return new Date(cursor).toISOString().slice(0, 10);
}

function mapToDisplayStatus(
  paymentStatus: PaymentStatus | null,
  balanceCents: number,
): BillingDisplayStatus {
  if (balanceCents > 0) return "overdue";
  if (!paymentStatus) return "overdue";
  if (paymentStatus === "failed" || paymentStatus === "unpaid") {
    return "overdue";
  }
  if (paymentStatus === "pending") return "grace_period";
  if (paymentStatus === "refunded") return "overdue";
  if (
    paymentStatus === "paid" ||
    paymentStatus === "authorized" ||
    paymentStatus === "waived"
  ) {
    return "paid";
  }
  return "overdue";
}

export type BillingDisplayStatus = "paid" | "overdue" | "grace_period";

export interface BillingStatus {
  planName: string | null;
  membershipFrequency: MembershipFrequency | null;
  membershipStatus: MembershipStatus | null;
  paymentStatus: PaymentStatus | null;
  displayStatus: BillingDisplayStatus;
  /** Estimated YYYY-MM-DD from plan period (null when unknown); replace with processor data later. */
  nextInvoiceDate: string | null;
  balanceCents: number;
  bookingRestricted: boolean;
  membershipValidTo: string | null;
  membershipValidFrom: string | null;
}

function emptyBillingStatus(): BillingStatus {
  return {
    planName: null,
    membershipFrequency: null,
    membershipStatus: null,
    paymentStatus: null,
    displayStatus: "overdue",
    nextInvoiceDate: null,
    balanceCents: 0,
    bookingRestricted: true,
    membershipValidTo: null,
    membershipValidFrom: null,
  };
}

type MembershipWithPlanRow = MembershipRow & {
  membership_plans: MembershipPlanRow | MembershipPlanRow[] | null;
};

function isMembershipInActiveWindow(row: MembershipRow, nowMs: number): boolean {
  if (row.status !== "active") return false;
  const fromMs = new Date(row.valid_from).getTime();
  if (fromMs > nowMs) return false;
  if (row.valid_to == null) return true;
  return new Date(row.valid_to).getTime() >= nowMs;
}

/**
 * Billing snapshot for an athlete (by **profile** id). Shared by athlete
 * billing UI, dashboard, and staff athlete profile (same Supabase + RLS rules).
 */
export async function getBillingStatusForAthlete(
  athleteProfileId: string,
): Promise<BillingStatus> {
  const athleteId = await getAthleteIdForProfileId(athleteProfileId);
  if (!athleteId) return emptyBillingStatus();

  const supabase = createSupabaseServerClient();
  const nowMs = Date.now();

  const [{ data: billingRaw }, { data: membershipRows, error }] =
    await Promise.all([
      supabase
        .from("billing_accounts")
        .select("balance_cents")
        .eq("athlete_id", athleteId)
        .maybeSingle(),
      supabase
        .from("memberships")
        .select(
          `
      id,
      athlete_id,
      plan_id,
      status,
      valid_from,
      valid_to,
      payment_status,
      created_at,
      updated_at,
      ${MEMBERSHIP_PLAN_SELECT}
    `,
        )
        .eq("athlete_id", athleteId)
        .order("valid_from", { ascending: false })
        .limit(25),
    ]);

  const balanceCents =
    billingRaw && typeof (billingRaw as { balance_cents?: number }).balance_cents === "number"
      ? Math.max(0, (billingRaw as { balance_cents: number }).balance_cents)
      : 0;

  if (error || !membershipRows?.length) {
    const out = emptyBillingStatus();
    out.balanceCents = balanceCents;
    if (balanceCents > 0) {
      out.displayStatus = "overdue";
    }
    out.bookingRestricted = out.displayStatus !== "paid";
    return out;
  }

  const rows = membershipRows as MembershipWithPlanRow[];
  const inWindow = rows.filter((r) => isMembershipInActiveWindow(r, nowMs));
  const chosen =
    inWindow[0] ??
    rows.find((r) => new Date(r.valid_from).getTime() <= nowMs) ??
    rows[0];

  const plan = normalizePlan(chosen.membership_plans);
  const displayStatus = mapToDisplayStatus(
    chosen.payment_status,
    balanceCents,
  );
  const nextInvoiceDate = estimateNextInvoiceDateIso(
    chosen.valid_from,
    plan?.period_days ?? null,
  );

  return {
    planName: plan?.name ?? null,
    membershipFrequency: plan?.membership_frequency ?? null,
    membershipStatus: chosen.status,
    paymentStatus: chosen.payment_status,
    displayStatus,
    nextInvoiceDate,
    balanceCents,
    bookingRestricted: displayStatus !== "paid",
    membershipValidTo: chosen.valid_to,
    membershipValidFrom: chosen.valid_from,
  };
}

export type ActiveMembershipWithPlan = MembershipRow & {
  membership_plans: MembershipPlanRow | null;
};

/**
 * Active membership for the athlete identified by their **profile** id,
 * including the related plan row under `membership_plans`.
 */
export async function getActiveMembershipForAthlete(
  athleteProfileId: string,
): Promise<ActiveMembershipWithPlan | null> {
  const athleteId = await getAthleteIdForProfileId(athleteProfileId);
  if (!athleteId) return null;

  const supabase = createSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const { data, error } = await supabase
    .from("memberships")
    .select(
      `
      id,
      athlete_id,
      plan_id,
      status,
      valid_from,
      valid_to,
      payment_status,
      created_at,
      updated_at,
      ${MEMBERSHIP_PLAN_SELECT}
    `,
    )
    .eq("athlete_id", athleteId)
    .eq("status", "active")
    .in("payment_status", ["authorized", "paid", "waived"])
    .lte("valid_from", nowIso)
    .order("valid_from", { ascending: false });

  if (error || !data?.length) return null;

  type Row = MembershipRow & {
    membership_plans: MembershipPlanRow | MembershipPlanRow[] | null;
  };

  const rows = data as Row[];
  const active = rows.find((m) => {
    if (m.valid_to == null) return true;
    return new Date(m.valid_to).getTime() >= nowMs;
  });

  if (!active) return null;

  const plan = active.membership_plans;
  const planRow = Array.isArray(plan) ? plan[0] ?? null : plan;

  return { ...active, membership_plans: planRow };
}

export interface BookingComplianceStatus {
  /** At least one confirmed booking with session start >= referenceDate + 28 days. */
  compliant: boolean;
  furthestBookedSessionStart: string | null;
}

export async function getBookingComplianceStatus(
  athleteProfileId: string,
  referenceDate: Date,
): Promise<BookingComplianceStatus> {
  const athleteId = await getAthleteIdForProfileId(athleteProfileId);
  if (!athleteId) {
    return { compliant: false, furthestBookedSessionStart: null };
  }

  const thresholdMs = fourWeekThreshold(referenceDate).getTime();

  const supabase = createSupabaseServerClient();

  const { data: bookingRows, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      sessions!inner (
        starts_at
      )
    `,
    )
    .eq("athlete_id", athleteId)
    .eq("status", "confirmed");

  if (error || !bookingRows?.length) {
    return { compliant: false, furthestBookedSessionStart: null };
  }

  type BookingJoin = {
    sessions: { starts_at: string } | { starts_at: string }[] | null;
  };

  let furthest: string | null = null;
  for (const row of bookingRows as BookingJoin[]) {
    const s = row.sessions;
    const starts = Array.isArray(s) ? s[0]?.starts_at : s?.starts_at;
    if (!starts) continue;
    const t = new Date(starts).getTime();
    if (t < thresholdMs) continue;
    if (!furthest || new Date(starts) > new Date(furthest)) {
      furthest = starts;
    }
  }

  return {
    compliant: furthest != null,
    furthestBookedSessionStart: furthest,
  };
}
