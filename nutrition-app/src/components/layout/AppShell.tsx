"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Scale, UtensilsCrossed, Dumbbell, Bike, LogOut, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/body-metrics", label: "Peso", icon: Scale },
  { href: "/meals", label: "Comidas", icon: UtensilsCrossed },
  { href: "/exercise", label: "Cardio", icon: Bike },
  { href: "/workouts", label: "Gimnasio", icon: Dumbbell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className="text-base font-semibold tracking-tight">
          🥗 Nutrition Tracker
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/targets"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            <Target className="h-3.5 w-3.5" />
            Objetivos
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-stretch justify-between px-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
