"use server";

import { redirect } from "next/navigation";

import { requireUserWithProfile } from "@/lib/auth";
import {
  type BookingErrorCode,
  bookingInvalidRequestMessage,
  createBookingForAthlete,
} from "@/lib/data/bookings";

export type BookingFormState =
  | { kind: "idle" }
  | { kind: "error"; code: BookingErrorCode; message: string };

const initialBookingFormState: BookingFormState = { kind: "idle" };

export { initialBookingFormState };

export async function bookSession(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const user = await requireUserWithProfile();
  if (user.role !== "athlete") {
    return {
      kind: "error",
      code: "GENERIC_BOOKING_ERROR",
      message: bookingInvalidRequestMessage,
    };
  }

  const sessionId = String(formData.get("sessionId") ?? "").trim();
  if (!sessionId) {
    return {
      kind: "error",
      code: "GENERIC_BOOKING_ERROR",
      message: bookingInvalidRequestMessage,
    };
  }

  const result = await createBookingForAthlete({
    athleteProfileId: user.id,
    sessionId,
  });

  if (!result.ok) {
    return {
      kind: "error",
      code: result.code,
      message: result.message,
    };
  }

  redirect("/athlete/sessions");
}
