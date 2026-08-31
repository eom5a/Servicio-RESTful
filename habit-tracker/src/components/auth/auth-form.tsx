"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; description: string; cta: string; switchHref: string; switchLabel: string }> = {
  login: {
    title: "Entrar",
    description: "Vuelve a tus hábitos de hoy.",
    cta: "Entrar",
    switchHref: "/signup",
    switchLabel: "¿No tienes cuenta? Crea una gratis",
  },
  signup: {
    title: "Crear cuenta",
    description: "Hábitos ilimitados, gratis. Sin tarjeta.",
    cta: "Crear mi cuenta",
    switchHref: "/login",
    switchLabel: "¿Ya tienes cuenta? Entra",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createClient();
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;

        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          toast.success("Cuenta creada. Revisa tu email para confirmarla.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        router.push("/app");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Algo ha ido mal.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      toast.error("Escribe tu email primero.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success("Te hemos enviado un enlace mágico a tu email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Algo ha ido mal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-1">
              {copy.cta}
            </Button>
          </form>

          <div className="mt-3 flex flex-col items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading || magicLinkSent}
              onClick={handleMagicLink}
            >
              {magicLinkSent ? "Enlace enviado ✓" : "Entrar sin contraseña (enlace mágico)"}
            </Button>
            <Link href={copy.switchHref} className="text-sm text-muted-foreground hover:text-foreground">
              {copy.switchLabel}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
