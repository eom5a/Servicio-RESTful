import path from "path";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Resolved to an absolute path explicitly: relative sqlite `file:` URLs otherwise depend on
// __dirname inside the generated client, which bundlers (Turbopack/webpack) can rewrite.
// Prisma treats a relative file: URL as relative to prisma/schema.prisma's directory
// (matching `prisma migrate`/`prisma studio`), so we mirror that here from process.cwd().
function resolveDatasourceUrl() {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  const filePath = raw.replace(/^file:/, "");
  if (path.isAbsolute(filePath)) return raw;
  return `file:${path.resolve(process.cwd(), "prisma", filePath)}`;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: resolveDatasourceUrl() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
