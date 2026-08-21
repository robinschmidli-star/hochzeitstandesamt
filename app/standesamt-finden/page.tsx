import { OfficeCard } from "@/components/OfficeCard";
import { SearchForm } from "@/components/SearchForm";
import { SwissMap } from "@/components/SwissMap";
import { createMetadata } from "@/lib/seo";
import { searchRegistryOffices } from "@/lib/search";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";
import { registrySearchLabels } from "@/lib/registry-search-labels";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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

  await prisma.websiteLead.create({
    data: {
      leadType: lead.lead_type,
      email: lead.email,
      firstName: lead.first_name,
      payload: lead,
      dedupeWeddingDate: lead.wedding_date || null,
      dedupeLocation: lead.wedding_location || null
    }
  });
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
  const requestedLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const labels = registrySearchLabels(await getDictionary(locale), locale);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-4xl font-semibold text-ink">{labels.title}</h1>
        <p className="mt-3 max-w-3xl text-soft-ink">
          {labels.intro}
        </p>
      </div>
      <section className="rounded-xl border border-linen bg-white p-4 shadow-soft sm:p-5">
        <SearchForm compact embedded labels={labels} />
        <div className="mt-4">
          <SwissMap embedded selectedCanton={canton} labels={labels} />
        </div>
      </section>
      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-ink">{results.length} {labels.results}</h2>
          <p className="text-sm text-soft-ink">{labels.sorted}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((office) => (
            <OfficeCard key={office.slug} office={office} labels={labels} />
          ))}
        </div>
      </section>
    </main>
  );
}
