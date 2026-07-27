import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient.
 *
 * In dev, Next.js hot-reloads server modules on every save, which would
 * otherwise create a new PrismaClient (and a new DB connection pool) on
 * every reload and quickly exhaust Postgres connections. Stashing the
 * instance on `globalThis` survives the module reload, so dev keeps
 * reusing the same client. In production this file is only evaluated
 * once per server instance, so the global is just a formality there.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
