import Link from "next/link";
import { SafeMediaFrame } from "@/components/SafeMediaFrame";
import { HomeHeroSearchClient } from "@/components/HomeHeroSearchClient";
import { SwissMap } from "@/components/SwissMap";
import { swissRegistryOffices } from "@/lib/registry-data";
import type { Dictionary } from "@/lib/i18n";
import { enrichOffice } from "@/lib/search-experience";
import { registryOfficeMedia } from "@/lib/safe-media";
import de from "@/locales/de.json";

function createTranslator(dictionary: Dictionary) {
  const fallback = de as Dictionary;
  return (key: string) => dictionary[key] ?? fallback[key] ?? key;
}

export function HomeHeroSearch({ dictionary }: { dictionary: Dictionary }) {
  const t = createTranslator(dictionary);

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-champagne">{t("hero.eyebrow")}</p>
        <h1 className="mt-4 max-w-5xl text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl">{t("hero.title")}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-soft-ink">{t("hero.subtitle")}</p>
        <HomeHeroSearchClient dictionary={dictionary} />
      </div>
    </section>
  );
}

export function PopularSearchLinks({ dictionary }: { dictionary: Dictionary }) {
  const t = createTranslator(dictionary);
  const links = [
    ["/search?tag=featured", t("popular.featured")],
    ["/search?tag=lake", t("popular.lake")],
    ["/search?tag=castle", t("popular.castle")]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-0 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">{t("popular.title")}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="focus-ring rounded-xl border border-linen bg-white p-4 font-semibold text-ink shadow-soft transition hover:border-champagne hover:text-sage">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SwitzerlandMapSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
      <SwissMap />
    </section>
  );
}

export function FeaturedRegistryOffices({ dictionary }: { dictionary: Dictionary }) {
  const t = createTranslator(dictionary);
  const featured = swissRegistryOffices
    .map((office) => enrichOffice(office))
    .filter((office) => office.tags.length > 0)
    .slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{t("featured.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">{t("featured.title")}</h2>
        </div>
        <Link href="/standesamt-finden" className="text-sm font-semibold text-sage">{t("featured.all")}</Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((office) => (
          <article key={office.slug} className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
            <div className="flex h-40 items-center justify-center bg-linen/70">
              <SafeMediaFrame media={registryOfficeMedia(office)} className="h-full w-full" />
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{office.city} · {office.canton}</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{office.name}</h3>
              <p className="mt-3 text-sm leading-6 text-soft-ink">{office.shortDescription}</p>
              <Link href={`/zivilstandsamt/${office.slug}`} className="focus-ring mt-4 inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">{t("featured.details")}</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeGuideTeasers({ dictionary }: { dictionary: Dictionary }) {
  const t = createTranslator(dictionary);
  const guides = [
    [t("guides.saturday"), "/search?weekday=saturday&saturdayOnly=true"],
    [t("guides.reserve"), "/ratgeber/heiraten-schweiz-offizielle-informationen"],
    [t("guides.cost"), "/ratgeber/heiraten-schweiz-offizielle-informationen"],
    [t("guides.beautiful"), "/search?tag=romantic"],
    [t("guides.outside"), "/ratgeber/heiraten-schweiz-offizielle-informationen"]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">{t("guides.title")}</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {guides.map(([label, href]) => (
          <Link key={label} href={href} className="focus-ring rounded-xl border border-linen bg-white p-5 font-semibold text-ink shadow-soft transition hover:border-sage/25 hover:text-sage">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
