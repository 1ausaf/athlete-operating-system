import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function AboutPage() {
  return (
    <PlaceholderPage
      eyebrow="About"
      title="Built for semi-private coaching."
      description="AOS standardizes how a facility books sessions, captures CAP notes, communicates with families, and keeps payment + compliance signals visible at a glance."
      nextUp={[
        "Coach + facility story",
        "Methodology and CAP framework overview",
        "Safe-Sport policy summary",
      ]}
    />
  );
}
