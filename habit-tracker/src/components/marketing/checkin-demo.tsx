"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Flame } from "lucide-react";

import { cn } from "@/lib/utils";

const DEMO_HABITS = [
  { emoji: "💧", label: "Beber agua" },
  { emoji: "📖", label: "Leer 10 min" },
  { emoji: "🧘", label: "Respirar" },
];

// Small, self-contained proof of the product's core loop for the landing
// page: one tap, instant reward, streak that only ever goes up here.
export function CheckinDemo() {
  const [done, setDone] = useState<boolean[]>(DEMO_HABITS.map(() => false));
  const streak = done.filter(Boolean).length;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Hoy</span>
        <span className="flex items-center gap-1 text-sm font-medium text-accent-foreground">
          <Flame className="size-4 text-accent" />
          {streak}/3
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {DEMO_HABITS.map((habit, i) => (
          <li key={habit.label}>
            <button
              type="button"
              onClick={() =>
                setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
              }
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                done[i]
                  ? "border-primary/30 bg-primary/10"
                  : "border-border hover:bg-secondary",
              )}
            >
              <span className="text-lg">{habit.emoji}</span>
              <span className="flex-1 text-sm font-medium">{habit.label}</span>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border transition-colors",
                  done[i]
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input",
                )}
              >
                <AnimatePresence>
                  {done[i] && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="size-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Pruébalo — un tap, sin cuenta, sin compromiso.
      </p>
    </div>
  );
}
