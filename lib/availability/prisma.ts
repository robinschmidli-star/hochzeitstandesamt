import { PrismaClient } from "@prisma/client";

const globalForAvailability = globalThis as unknown as { availabilityPrisma?: PrismaClient };

function availabilityDatabaseUrl() {
  const url =
    process.env.WEB_PUBLIC_REPLICA_DATABASE_URL ??
    process.env.PUBLIC_REPLICA_DATABASE_URL;

  if (!url) {
    throw new Error(
      "WEB_PUBLIC_REPLICA_DATABASE_URL or PUBLIC_REPLICA_DATABASE_URL is required for availability"
    );
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
