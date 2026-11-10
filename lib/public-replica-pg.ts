import type pg from "pg";

export function publicReplicaPoolConfig(connectionString: string): pg.PoolConfig {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode) url.searchParams.delete("sslmode");

  const sslRequired =
    process.env.PUBLIC_REPLICA_DATABASE_SSL === "require" ||
    ["prefer", "require", "verify-ca", "verify-full"].includes(sslMode ?? "");

  return {
    connectionString: url.toString(),
    ssl: sslRequired
      ? { rejectUnauthorized: process.env.PUBLIC_REPLICA_DATABASE_SSL_VERIFY !== "false" }
      : undefined,
  };
}
