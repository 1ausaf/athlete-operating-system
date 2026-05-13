"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

import {
  bookSession,
  initialBookingFormState,
  type BookingFormState,
} from "./actions";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Booking…" : "Book"}
    </Button>
  );
}

export function SessionBookForm({
  sessionId,
  isBooked,
}: {
  sessionId: string;
  isBooked: boolean;
}) {
  const [state, formAction] = useFormState(bookSession, initialBookingFormState);

  if (isBooked) {
    return (
      <Button type="button" disabled variant="secondary">
        Booked
      </Button>
    );
  }

  return (
    <div className="flex min-w-[140px] flex-col items-end gap-1">
      <form action={formAction} className="flex flex-col items-end gap-1">
        <input type="hidden" name="sessionId" value={sessionId} />
        <SubmitButton disabled={false} />
      </form>
      <BookingFeedback state={state} />
    </div>
  );
}

function BookingFeedback({ state }: { state: BookingFormState }) {
  if (state.kind !== "error") return null;
  return (
    <p className="max-w-[220px] text-right text-xs text-destructive" role="alert">
      {state.message}
    </p>
  );
}
