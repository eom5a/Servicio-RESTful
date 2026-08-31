import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Single-user app for now: there is exactly one User row, created lazily.
 * Every DB query still goes through userId so a future multi-user version
 * only has to change where this id comes from.
 */
export const getDefaultUser = cache(async () => {
  const existing = await prisma.user.findFirst();
  if (existing) return existing;

  return prisma.user.create({
    data: { email: process.env.OWNER_EMAIL ?? undefined },
  });
});
