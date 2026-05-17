import Link from "next/link";
import { registryCantons } from "@/lib/registry-data";
import { repairText, type EnrichedRegistryOffice, type SearchParams } from "@/lib/search-experience";

const weekdayLabels: Record<string, string> = {
  monday: "Mo",
  tuesday: "Di",
  wednesday: "Mi",
  thursday: "Do",
  friday: "Fr",
  saturday: "Sa",
  sunday: "So"
};

export function SearchFilters({ params }: { params: SearchParams }) {
  return (
    <aside className="rounded-xl border border-linen bg-white p-5 shadow-soft">
      <h2 className="text-xl font-semibold text-ink">Filter</h2>
      <form action="/search" className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Ort / PLZ
          <input name="location" defaultValue={params.location} placeholder="z.B. Bern" className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Radius
            <select name="radius" defaultValue={params.radius || "50"} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Kanton
            <select name="canton" defaultValue={params.canton} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
              <option value="">Alle Kantone</option>
              {registryCantons.map((canton) => (
                <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Wochentag
          <select name="weekday" defaultValue={params.weekday || ""} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Alle</option>
            <option value="saturday">Samstag</option>
            <option value="friday">Freitag</option>
            <option value="thursday">Donnerstag</option>
          </select>
        </label>
        <div className="grid gap-2">
          <label className="flex gap-3 text-sm text-soft-ink">
            <input name="saturdayOnly" value="true" defaultChecked={params.saturdayOnly === "true"} type="checkbox" className="mt-1 h-4 w-4 rounded border-linen accent-sage" />
            Nur Samstagstrauungen
          </label>
          {[
            ["evening", "Abendtrauung möglich"],
            ["outdoor", "Trauung im Freien"],
            ["wheelchair", "Rollstuhlgängig"],
            ["parking", "Parkplätze vorhanden"],
            ["onlineBooking", "Online Terminbuchung"],
            ["multipleVenues", "Mehrere Traulokale"]
          ].map(([name, label]) => (
            <label key={name} className="flex gap-3 text-sm text-soft-ink">
              <input name={name} value="yes" defaultChecked={params[name as keyof SearchParams] === "yes"} type="checkbox" className="mt-1 h-4 w-4 rounded border-linen accent-sage" />
              {label}
            </label>
          ))}
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Mindest-Gästezahl
          <input name="maxGuests" defaultValue={params.maxGuests} inputMode="numeric" placeholder="z.B. 50" className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Stil
          <select name="tag" defaultValue={params.tag || ""} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Alle</option>
            <option value="featured">schönste Standesämter</option>
            <option value="castle">Schloss</option>
            <option value="lake">See</option>
            <option value="mountains">Berge</option>
            <option value="historic">historisch</option>
            <option value="modern">modern</option>
            <option value="romantic">romantisch</option>
            <option value="city">Stadt</option>
            <option value="nature">Natur</option>
          </select>
        </label>
        <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white">Filter anwenden</button>
      </form>
    </aside>
  );
}

export function RegistryOfficeCard({ office }: { office: EnrichedRegistryOffice }) {
  const officialUrl = office.website_url || office.officialUrl;

  return (
    <article className="grid gap-4 rounded-xl border border-linen bg-white p-4 shadow-soft sm:grid-cols-[140px_1fr]">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-linen/70">
        {office.imageUrl || office.coatOfArmsUrl ? (
          <img src={office.imageUrl || office.coatOfArmsUrl} alt={office.mediaAlt || office.name} className="h-full w-full object-contain p-5" loading="lazy" />
        ) : (
          <span className="text-sm font-semibold text-soft-ink">{office.city}</span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{office.city} · {office.canton}</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">{office.name}</h2>
        <p className="mt-2 text-sm leading-6 text-soft-ink">{office.shortDescription}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {office.premiumVenueNames.slice(0, 2).map((venue) => (
            <span key={venue} className="rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-sage">{venue}</span>
          ))}
          {office.available_weekdays.map((day) => (
            <span key={day} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-soft-ink">{weekdayLabels[day] ?? day}</span>
          ))}
          {office.saturday_weddings_available === true ? (
            <span className="rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-sage">Samstagstrauungen möglich</span>
          ) : null}
          {typeof office.distanceKm === "number" ? (
            <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">{Math.round(office.distanceKm)} km entfernt</span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/zivilstandsamt/${office.slug}`} className="focus-ring rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">Details ansehen</Link>
          {officialUrl?.startsWith("https://") ? (
            <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage">
              Zur offiziellen Seite
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function SearchResultsPage({ params, results }: { params: SearchParams; results: EnrichedRegistryOffice[] }) {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Standesamt-Suche</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Passende Standesämter finden</h1>
        <p className="mt-3 max-w-3xl text-soft-ink">Filtere nach Datum, Region oder Stil. Die Verfügbarkeiten dienen als Orientierung und müssen direkt beim Amt bestätigt werden.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <SearchFilters params={params} />
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-ink">{results.length} Ergebnisse</h2>
            <Link href="/" className="text-sm font-semibold text-sage">Suche ändern</Link>
          </div>
          <div className="mt-4 grid gap-4">
            {results.map((office) => (
              <RegistryOfficeCard key={office.slug} office={office} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
