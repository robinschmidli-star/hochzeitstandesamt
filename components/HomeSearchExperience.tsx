import Link from "next/link";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { SwissMap } from "@/components/SwissMap";
import { enrichOffice, repairText } from "@/lib/search-experience";
import { HomeHeroSearchClient } from "@/components/HomeHeroSearchClient";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, index) => String(currentYear + index));
const months = [
  ["01", "Januar"],
  ["02", "Februar"],
  ["03", "März"],
  ["04", "April"],
  ["05", "Mai"],
  ["06", "Juni"],
  ["07", "Juli"],
  ["08", "August"],
  ["09", "September"],
  ["10", "Oktober"],
  ["11", "November"],
  ["12", "Dezember"]
];
const tags = [
  ["featured", "schönste"],
  ["castle", "Schloss"],
  ["lake", "See"],
  ["mountains", "Berge"],
  ["historic", "historisch"],
  ["modern", "modern"],
  ["romantic", "romantisch"],
  ["city", "Stadt"],
  ["nature", "Natur"]
];

function Icon({ type }: { type: "date" | "location" | "heart" }) {
  const path =
    type === "date"
      ? "M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      : type === "location"
        ? "M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11ZM12 10.5h.01"
        : "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z";

  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 text-sage">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function DateSearchCard() {
  return (
    <form action="/search" className="grid gap-4 rounded-xl border border-linen bg-white p-5 shadow-soft">
      <Icon type="date" />
      <div>
        <h2 className="text-2xl font-semibold text-ink">Ich habe ein Datum im Kopf</h2>
        <p className="mt-2 text-sm leading-6 text-soft-ink">Suche nach Monat, Jahr oder bevorzugtem Trautag.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Monat
          <select name="month" className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Monat auswählen</option>
            {months.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Jahr
          <select name="year" className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Jahr auswählen</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-ink">
        Wochentag
        <select name="weekday" className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
          <option value="saturday">Samstag</option>
          <option value="friday">Freitag</option>
          <option value="thursday">Donnerstag</option>
          <option value="any">egal</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-ink">
        Konkretes Datum optional
        <input name="date" type="date" className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
      </label>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">Standesämter mit passenden Trautagen finden</button>
    </form>
  );
}

export function LocationSearchCard() {
  return (
    <form action="/search" className="grid gap-4 rounded-xl border border-linen bg-white p-5 shadow-soft">
      <Icon type="location" />
      <div>
        <h2 className="text-2xl font-semibold text-ink">Standesämter in meiner Nähe</h2>
        <p className="mt-2 text-sm leading-6 text-soft-ink">Finde passende Ämter rund um euren Wohnort oder Wunschort.</p>
      </div>
      <label className="grid gap-2 text-sm font-medium text-ink">
        Ort / PLZ
        <input name="location" placeholder="z.B. Bern oder 3000" className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Radius
          <select name="radius" defaultValue="50" className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Kanton optional
          <select name="canton" className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Alle Kantone</option>
            {registryCantons.map((canton) => (
              <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>
            ))}
          </select>
        </label>
      </div>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">Standesämter in der Nähe anzeigen</button>
    </form>
  );
}

export function InspirationSearchCard() {
  return (
    <form action="/search" className="grid gap-4 rounded-xl border border-linen bg-white p-5 shadow-soft">
      <Icon type="heart" />
      <div>
        <h2 className="text-2xl font-semibold text-ink">Schöne Orte entdecken</h2>
        <p className="mt-2 text-sm leading-6 text-soft-ink">Startet mit Stil, Landschaft oder Stimmung statt mit Formularen.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(([value, label]) => (
          <label key={value} className="cursor-pointer">
            <input type="radio" name="tag" value={value} className="peer sr-only" />
            <span className="inline-flex rounded-full border border-linen bg-paper px-3 py-2 text-sm font-semibold text-soft-ink transition peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-white">
              {label}
            </span>
          </label>
        ))}
      </div>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">Schönste Standesämter entdecken</button>
    </form>
  );
}

export function SearchModeTabs() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DateSearchCard />
      <LocationSearchCard />
      <InspirationSearchCard />
    </div>
  );
}

export function HomeHeroSearch() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-champagne">Schweizer Hochzeitsplattform</p>
        <h1 className="mt-4 max-w-5xl text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl">Finde das passende Standesamt für eure Hochzeit in der Schweiz</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-soft-ink">Suche nach Datum, Region, Stil oder Verfügbarkeit und entdecke die schönsten Orte für eure Trauung.</p>
        <HomeHeroSearchClient />
      </div>
    </section>
  );
}

export function PopularSearchLinks() {
  const links = [
    ["/search?tag=featured", "Schönste Standesämter der Schweiz"],
    ["/search?tag=lake", "Standesämter am See"],
    ["/search?tag=castle", "Standesämter in Schlössern"]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-0 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">Beliebte Suchanfragen</h2>
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

export function FeaturedRegistryOffices() {
  const featured = swissRegistryOffices
    .map((office) => enrichOffice(office))
    .filter((office) => office.tags.length > 0)
    .slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Inspiration</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Inspirierende Standesämter</h2>
        </div>
        <Link href="/search?tag=romantic" className="text-sm font-semibold text-sage">Alle entdecken</Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((office) => (
          <article key={office.slug} className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
            <div className="flex h-40 items-center justify-center bg-linen/70">
              {office.imageUrl || office.coatOfArmsUrl ? (
                <img src={office.imageUrl || office.coatOfArmsUrl} alt={office.mediaAlt || office.name} className="h-full w-full object-contain p-8" loading="lazy" />
              ) : (
                <span className="text-sm font-semibold text-soft-ink">{office.city}</span>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{office.city} · {office.canton}</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{office.name}</h3>
              <p className="mt-3 text-sm leading-6 text-soft-ink">{office.shortDescription}</p>
              <Link href={`/zivilstandsamt/${office.slug}`} className="focus-ring mt-4 inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">Details ansehen</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeGuideTeasers() {
  const guides = [
    ["Heiraten am Samstag in der Schweiz", "/search?weekday=saturday&saturdayOnly=true"],
    ["Wie früh muss man ein Standesamt reservieren?", "/ratgeber/heiraten-schweiz-offizielle-informationen"],
    ["Was kostet eine zivile Trauung in der Schweiz?", "/ratgeber/heiraten-schweiz-offizielle-informationen"],
    ["Die schönsten Standesämter der Schweiz", "/search?tag=romantic"],
    ["Heiraten ausserhalb des Wohnorts", "/ratgeber/heiraten-schweiz-offizielle-informationen"]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">Ratgeber rund ums Heiraten</h2>
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
