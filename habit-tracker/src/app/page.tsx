import Link from "next/link";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckinDemo } from "@/components/marketing/checkin-demo";

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Un tap, listo",
    body: "Registrar un hábito nunca pide más de un gesto. Sin formularios, sin fricción.",
  },
  {
    icon: ShieldCheck,
    title: "Rachas que no castigan",
    body: "Un mal día no te resetea a cero. Las rachas se protegen, no se pierden.",
  },
  {
    icon: Sparkles,
    title: "Gratis de verdad",
    body: "Hábitos ilimitados sin coste. Sin capar lo básico para forzarte a pagar.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">Nudge</span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Empezar gratis</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-16 px-6 pb-24 pt-8 md:pt-16">
        <section className="grid w-full items-center gap-12 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col items-start gap-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
              Hábitos sin culpa, hechos para tu cerebro.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground text-pretty">
              Nudge es el habit tracker pensado para mentes con TDAH: fricción
              mínima, recompensa inmediata y rachas que perdonan un mal día en
              vez de castigarlo.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Crear mi primer hábito</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#como-funciona">Ver cómo funciona</Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <CheckinDemo />
          </div>
        </section>

        <section
          id="como-funciona"
          className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Nudge</span>
          <span>Hecho para cerebros que funcionan distinto.</span>
        </div>
      </footer>
    </div>
  );
}
