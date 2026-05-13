import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AthleteBillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Athlete Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Billing
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Open balance, next charge, payment method. A lapsed membership or
          past-due balance pauses booking until resolved.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Open balance</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Account in good standing.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Next charge</CardDescription>
            <CardTitle className="text-2xl">$220.00</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Posts in 12 days. Membership: Semi-private 3x / week.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Payment method</CardDescription>
            <CardTitle className="text-base font-medium">
              Visa ending 4242
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              Default card on file.
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking impact</CardTitle>
          <CardDescription>
            Booking is gated by membership and payment status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" aria-hidden />
            Active membership - canBookSession() will pass for in-cadence slots.
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden />
            If the next charge fails, booking auto-pauses 24 hours later.
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button disabled variant="outline">
              Update payment method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
