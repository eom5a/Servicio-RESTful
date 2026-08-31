import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/session";

/** For Server Components/pages: redirects to /login when unauthenticated. */
export const requireSession = cache(async () => {
  const ok = await hasValidSession();
  if (!ok) redirect("/login");
});

/** For Route Handlers: returns false instead of redirecting, so callers can return a 401. */
export async function isAuthenticated() {
  return hasValidSession();
}
