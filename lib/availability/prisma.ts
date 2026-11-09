import { PrismaClient } from "@prisma/client";

const globalForAvailability = globalThis as unknown as { availabilityPrisma?: PrismaClient };

function availabilityDatabaseUrl() {
  const publisherUrl = process.env.REPLICA_PUBLISH_DATABASE_URL;
  if (process.env.VERCEL_ENV === "production" && !publisherUrl) {
    throw new Error("REPLICA_PUBLISH_DATABASE_URL is required for production availability writes");
  }

  const url =
    publisherUrl ??
    process.env.WEB_PUBLIC_REPLICA_DATABASE_URL ??
    process.env.PUBLIC_REPLICA_DATABASE_URL;

  if (!url) {
    throw new Error(
      "REPLICA_PUBLISH_DATABASE_URL, WEB_PUBLIC_REPLICA_DATABASE_URL or PUBLIC_REPLICA_DATABASE_URL is required for availability"
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
