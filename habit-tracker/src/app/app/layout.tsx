import Link from "next/link";
import { Flame, LineChart, Settings } from "lucide-react";

const NAV = [
  { href: "/app", label: "Hoy", icon: Flame },
  { href: "/app/progress", label: "Progreso", icon: LineChart },
  { href: "/app/settings", label: "Ajustes", icon: Settings },
] as const;

// Shared chrome for the authenticated area. Auth gating (redirect to
// /login when there's no session) is wired up in Phase 1 alongside
// Supabase Auth itself.
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Nudge
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">{children}</main>
    </div>
  );
}
