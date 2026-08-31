import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return (
    <StubPage
      title="Crear cuenta"
      description="El alta con Supabase Auth se construye en la Fase 1."
      phase="Fase 1"
    />
  );
}
