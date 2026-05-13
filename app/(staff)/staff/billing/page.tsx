import { ArrowUpRight, CreditCard, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const plans = [
  { name: "Semi-private 2x / week", price: "$160 / mo", active: 24 },
  { name: "Semi-private 3x / week", price: "$220 / mo", active: 18 },
  { name: "Open gym", price: "$80 / mo", active: 9 },
];

export default function StaffBillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Billing
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Revenue, outstanding balances, and membership plan management. Plan
          edits are owner / admin only - canManageMemberships() gates write
          actions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Monthly recurring revenue</CardDescription>
            <CardTitle className="text-2xl">$9,840</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            +4.2% vs. last month
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Outstanding balance</CardDescription>
            <CardTitle className="text-2xl">$420.00</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            2 past-due invoices.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active memberships</CardDescription>
            <CardTitle className="text-2xl">51</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            6 trials, 3 lapsed in the last 30 days.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden />
              Membership plans
            </CardTitle>
            <CardDescription>
              Pricing and frequency caps. Editing is gated by
              canManageMemberships().
            </CardDescription>
          </div>
          <Button size="sm" disabled>
            New plan
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col">
          {plans.map((plan, index) => (
            <div key={plan.name}>
              {index > 0 ? <Separator className="my-3" /> : null}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{plan.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.active} active members
                  </span>
                </div>
                <span className="text-sm">{plan.price}</span>
                <Button variant="ghost" size="sm" disabled>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Receipt className="h-3.5 w-3.5" aria-hidden />
        Invoice export and Stripe sync land alongside the billing API.
      </p>
    </div>
  );
}
