import pg from "pg";
import { defaultLocale, type Locale } from "@/lib/i18n";

const globalForTranslations = globalThis as unknown as { translationPool?: pg.Pool };

function pool() {
  const connectionString = process.env.PUBLIC_REPLICA_DATABASE_URL;
  if (!connectionString) return null;
  globalForTranslations.translationPool ??= new pg.Pool({
    connectionString,
    ssl: process.env.PUBLIC_REPLICA_DATABASE_SSL === "require"
      ? { rejectUnauthorized: process.env.PUBLIC_REPLICA_DATABASE_SSL_VERIFY !== "false" }
      : undefined
  });
  return globalForTranslations.translationPool;
}

export async function contentTranslations(
  entityType: "civil_registry_office" | "wedding_venue",
  entityIds: string[],
  locale: Locale,
  fieldName: string
) {
  if (locale === defaultLocale || entityIds.length === 0) return new Map<string, string>();
  const database = pool();
  if (!database) return new Map<string, string>();
  try {
    const result = await database.query<{ entity_id: string; value: string }>(
      `SELECT entity_id::text, value
       FROM web_public_localized_content
       WHERE entity_type = $1 AND entity_id = ANY($2::uuid[])
         AND language_code = $3 AND field_name = $4 AND status <> 'STALE'`,
      [entityType, entityIds, locale, fieldName]
    );
    return new Map(result.rows.map((row) => [row.entity_id, row.value]));
  } catch (error) {
    console.error("Content translation fallback", error);
    return new Map<string, string>();
  }
}
