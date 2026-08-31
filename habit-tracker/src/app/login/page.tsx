import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <StubPage
      title="Entrar"
      description="El formulario de acceso (email/password, magic link, Google) se construye en la Fase 1."
      phase="Fase 1"
    />
  );
}
