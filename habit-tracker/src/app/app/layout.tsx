import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, LineChart, LogOut, Settings } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/app", label: "Hoy", icon: Flame },
  { href: "/app/progress", label: "Progreso", icon: LineChart },
  { href: "/app/settings", label: "Ajustes", icon: Settings },
] as const;

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="size-4" />
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">{children}</main>
    </div>
  );
}
