import Link from "next/link";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserWithProfile } from "@/lib/auth";
import {
  bookingStatusTone,
  formatBookingPaymentPair,
  formatBookingStatusLabel,
  formatPaymentStatusLabel,
  paymentStatusTone,
} from "@/lib/data/booking-status-labels";
import { statusToneToBadgeClass } from "@/lib/ui/status";
import { listSessionRoster } from "@/lib/data/sessions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/rbac";
import type { Database } from "@/types/db";

type SessionMeta = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  "id" | "starts_at" | "ends_at" | "location" | "capacity" | "status"
>;

interface PageProps {
  params: { sessionId: string };
}

export default async function StaffSessionRosterPage({ params }: PageProps) {
  const { sessionId } = params;
  const user = await requireUserWithProfile();
  if (!isStaff(user)) {
    redirect("/athlete/dashboard");
  }

  const supabase = createSupabaseServerClient();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("id, starts_at, ends_at, location, capacity, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !session) {
    notFound();
  }

  const sessionRow = session as SessionMeta;

  const roster = await listSessionRoster(sessionId);
  const listHref = "/staff/sessions" as Route;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Link href={listHref} className="hover:underline">
            Sessions
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Session roster
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date(sessionRow.starts_at).toLocaleString()} –{" "}
          {new Date(sessionRow.ends_at).toLocaleString()}
          {sessionRow.location ? ` · ${sessionRow.location}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Athletes</CardTitle>
          <CardDescription>
            Columns marked TODO are placeholders until program-day logic and
            billing joins exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings on this session.</p>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                {/* TODO: use roster row bookingId for mutations — grant payment exception, force-confirm booking. */}
                TODO: admin/staff overrides — e.g. grant payment exception,
                force-confirm booking.
              </p>
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Athlete</th>
                  <th className="py-2 pr-3 font-medium">Program day</th>
                  <th className="py-2 pr-3 font-medium">Last CAP</th>
                  <th className="py-2 pr-3 font-medium">Injury</th>
                  <th className="py-2 pr-3 font-medium">Booking / payment</th>
                  <th className="py-2 font-medium">Account billing</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const bookingTone = bookingStatusTone(r.bookingStatus);
                  const payTone = paymentStatusTone(r.bookingPaymentStatus);
                  return (
                  <tr key={r.bookingId} className="border-b last:border-0">
                    <td className="py-3 pr-3 align-top font-medium">{r.fullName}</td>
                    <td className="py-3 pr-3 align-top text-muted-foreground">
                      {r.programDayLabel}
                    </td>
                    <td className="py-3 pr-3 align-top text-muted-foreground">
                      {r.lastCapNoteAt
                        ? new Date(r.lastCapNoteAt).toLocaleDateString()
                        : "TODO"}
                    </td>
                    <td className="py-3 pr-3 align-top">
                      {r.injuryFlag ? "Flagged" : "—"}
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={statusToneToBadgeClass(bookingTone)}
                          title={formatBookingStatusLabel(r.bookingStatus)}
                        >
                          {formatBookingStatusLabel(r.bookingStatus)}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span
                          className={statusToneToBadgeClass(payTone)}
                          title={formatPaymentStatusLabel(r.bookingPaymentStatus)}
                        >
                          {formatPaymentStatusLabel(r.bookingPaymentStatus)}
                        </span>
                      </div>
                      <p className="sr-only">
                        {formatBookingPaymentPair(
                          r.bookingStatus,
                          r.bookingPaymentStatus,
                        )}
                      </p>
                    </td>
                    <td className="py-3 align-top text-muted-foreground">
                      {r.paymentStatusLabel}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
