/** Local integration testing only; never enables tracking against a live database. */
export function isIsolatedAnalyticsTest() {
  if (process.env.ANALYTICS_TEST_MODE !== "1" || process.env.VERCEL_ENV === "production") return false;
  try {
    const database = new URL(process.env.DATABASE_URL ?? "");
    return ["127.0.0.1", "localhost", "[::1]"].includes(database.hostname)
      && /^\/hsa_analytics_e2e_[a-z0-9_]+$/.test(database.pathname);
  } catch { return false; }
}
