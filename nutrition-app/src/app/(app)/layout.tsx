import { requireSession } from "@/lib/dal";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <AppShell>{children}</AppShell>;
}
