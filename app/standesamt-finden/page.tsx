import { OfficeCard } from "@/components/OfficeCard";
import { SearchForm } from "@/components/SearchForm";
import { SwissMap } from "@/components/SwissMap";
import { createMetadata } from "@/lib/seo";
import { searchRegistryOffices } from "@/lib/search";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";
import { registrySearchLabels } from "@/lib/registry-search-labels";
import { headers } from "next/headers";

const searchMetadata = {
  title: "Standesamt finden in der Schweiz",
  description: "Suche Zivilstandsämter nach Kanton, Gemeinde, Postleitzahl oder Name des Zivilstandskreises.",
  path: "/standesamt-finden"
};

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return {
    ...createMetadata(searchMetadata),
    ...(Object.keys(params).length ? { robots: { index: false, follow: true } } : {})
  };
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
        {results.length === 0 ? (
          <div className="rounded-xl border border-linen bg-white p-6 text-center shadow-soft">
            <h3 className="text-xl font-semibold text-ink">{labels.noResults}</h3>
            <p className="mt-2 text-sm leading-6 text-soft-ink">{labels.noResultsHint}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
