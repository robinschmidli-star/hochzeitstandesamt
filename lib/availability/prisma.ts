import { PrismaClient } from "@prisma/client";

const globalForAvailability = globalThis as unknown as { availabilityPrisma?: PrismaClient };

function availabilityDatabaseUrl() {
  // Availability writes require an explicitly provisioned, least-privilege
  // connection to the database containing the availability_* tables.
  // The public replica URL is intentionally read-only and must never be used.
  const url = process.env.AVAILABILITY_DATABASE_URL;
  if (!url) {
    throw new Error("AVAILABILITY_DATABASE_URL is required for availability writes");
  }
  return url;
}

export const availabilityPrisma =
  globalForAvailability.availabilityPrisma ??
  new PrismaClient({
    datasourceUrl: availabilityDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForAvailability.availabilityPrisma = availabilityPrisma;
}
