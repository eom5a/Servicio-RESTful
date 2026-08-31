import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Suscripción" };

export default function BillingPage() {
  return (
    <StubPage
      title="Suscripción"
      description="Paywall con Stripe Checkout y Customer Portal — Fase 5."
      phase="Fase 5"
    />
  );
}
