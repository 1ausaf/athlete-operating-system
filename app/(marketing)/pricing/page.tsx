import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function PricingPage() {
  return (
    <PlaceholderPage
      eyebrow="Pricing"
      title="Membership tiers."
      description="Pricing details land here once the memberships table is in place. Each tier maps to a booking frequency cap enforced at booking time."
      nextUp={[
        "Tier comparison table",
        "Frequency caps per tier",
        "Family / multi-athlete discount",
      ]}
    />
  );
}
