import { OfficeCard } from "@/components/OfficeCard";
import { SearchForm } from "@/components/SearchForm";
import { SwissMap } from "@/components/SwissMap";
import { createMetadata } from "@/lib/seo";
import { searchRegistryOffices } from "@/lib/search";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const metadata = createMetadata({
  title: "Standesamt finden in der Schweiz",
  description: "Suche Zivilstandsämter nach Kanton, Gemeinde, Postleitzahl oder Name des Zivilstandskreises.",
  path: "/standesamt-finden"
});

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getParams(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function saveSearchLead(params: Record<string, string | string[] | undefined>) {
  if (getParam(params, "submitted") !== "1") return;

  const dateStart = getParam(params, "dateStart");
  const dateEnd = getParam(params, "dateEnd");
  const lead = {
    lead_type: "registry_search",
    source_page: "/standesamt-finden",
    first_name: "",
    last_name: "",
    email: getParam(params, "email"),
    phone: "",
    address: "",
    canton: getParam(params, "canton"),
    wedding_location: getParam(params, "query"),
    wedding_date: dateStart || dateEnd ? `${dateStart || "offen"} bis ${dateEnd || "offen"}` : "",
    wedding_date_start: dateStart,
    wedding_date_end: dateEnd,
    preferred_weekdays: getParams(params, "preferredWeekdays"),
    date_flexibility: getParam(params, "dateFlexibility"),
    legal_topic: "",
    message: "",
    consent_privacy: false,
    consent_forwarding: false,
    marketing_opt_in: getParam(params, "marketingOptIn") === "yes",
    created_at: new Date().toISOString(),
    status: "new"
  };

  const storageDir = path.join(process.cwd(), "storage");
  await mkdir(storageDir, { recursive: true });
  await appendFile(path.join(storageDir, "leads.jsonl"), `${JSON.stringify(lead)}\n`, "utf8");
}

export default async function RegistrySearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const canton = typeof params.canton === "string" ? params.canton : "";
  const postalCode = typeof params.postalCode === "string" ? params.postalCode : "";
  await saveSearchLead(params);
  const results = searchRegistryOffices({ query, canton, postalCode });

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-4xl font-semibold text-ink">Zivilstandsamt finden</h1>
        <p className="mt-3 max-w-3xl text-soft-ink">
          Suche nach Kanton, Gemeinde, Ort, Postleitzahl oder Name des Zivilstandskreises. Die Ergebnisse basieren auf deiner importierten Schweizer Liste.
        </p>
      </div>
      <section className="rounded-xl border border-linen bg-white p-4 shadow-soft sm:p-5">
        <SearchForm compact embedded />
        <div className="mt-4">
          <SwissMap embedded selectedCanton={canton} />
        </div>
      </section>
      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-ink">{results.length} Treffer</h2>
          <p className="text-sm text-soft-ink">Sortiert nach Kanton und Amt</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((office) => (
            <OfficeCard key={office.slug} office={office} />
          ))}
        </div>
      </section>
    </main>
  );
}
