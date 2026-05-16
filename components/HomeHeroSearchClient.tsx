"use client";

import { useRef, useState } from "react";
import { registryCantons } from "@/lib/registry-data";
import { repairText } from "@/lib/search-experience";

type SearchType = "date" | "location" | "style";

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

const searchTypes = [
  {
    type: "date" as const,
    icon: "date" as const,
    title: "Datum im Kopf",
    text: "Suche nach Monat, Jahr, Wochentag oder konkretem Datum."
  },
  {
    type: "location" as const,
    icon: "location" as const,
    title: "In meiner Nähe",
    text: "Finde Standesämter rund um euren Wohnort oder Wunschort."
  },
  {
    type: "style" as const,
    icon: "heart" as const,
    title: "Schöne Orte",
    text: "Entdecke besondere Trauorte nach Stil, Landschaft oder Stimmung."
  }
];

function Icon({ type }: { type: "date" | "location" | "heart" }) {
  const path =
    type === "date"
      ? "M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      : type === "location"
        ? "M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11ZM12 10.5h.01"
        : "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z";

  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/10 text-sage">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function SearchTypeCard({
  type,
  icon,
  title,
  text,
  selected,
  onSelect
}: {
  type: SearchType;
  icon: "date" | "location" | "heart";
  title: string;
  text: string;
  selected: boolean;
  onSelect: (type: SearchType) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`focus-ring grid h-full gap-4 rounded-xl border bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-champagne ${
        selected ? "border-sage" : "border-linen"
      }`}
    >
      <Icon type={icon} />
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-soft-ink">{text}</p>
      </div>
      <span className="mt-auto inline-flex justify-center rounded-lg bg-sage px-4 py-3 text-sm font-semibold text-white">
        Diese Suche starten
      </span>
    </button>
  );
}

export function SearchEntryCards({
  selectedSearchType,
  onSelect
}: {
  selectedSearchType: SearchType | null;
  onSelect: (type: SearchType) => void;
}) {
  return (
    <div className={`grid gap-4 ${selectedSearchType ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {searchTypes.map((item) => (
        <SearchTypeCard key={item.type} {...item} selected={selectedSearchType === item.type} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function DateSearchForm() {
  return (
    <form action="/search" className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Monat
          <select name="month" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Monat auswählen</option>
            {months.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Jahr
          <select name="year" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Jahr auswählen</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Wochentag
          <select name="weekday" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="saturday">Samstag</option>
            <option value="friday">Freitag</option>
            <option value="thursday">Donnerstag</option>
            <option value="any">egal</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Konkretes Datum optional
          <input name="date" type="date" className="focus-ring h-12 rounded-lg border border-linen px-3 text-soft-ink" />
        </label>
      </div>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">Passende Trautage finden</button>
    </form>
  );
}

export function LocationSearchForm() {
  return (
    <form action="/search" className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-ink">
        Ort / PLZ
        <input name="location" placeholder="z.B. Bern oder 3000" className="focus-ring h-12 rounded-lg border border-linen px-3 text-soft-ink" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Radius
          <select name="radius" defaultValue="50" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Kanton optional
          <select name="canton" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
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

export function StyleSearchForm() {
  return (
    <form action="/search" className="grid gap-5">
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
      <label className="grid gap-2 text-sm font-medium text-ink">
        Kanton / Region optional
        <select name="canton" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
          <option value="">Alle Regionen</option>
          {registryCantons.map((canton) => (
            <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>
          ))}
        </select>
      </label>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">Schönste Standesämter entdecken</button>
    </form>
  );
}

export function ExpandedSearchPanel({ selectedSearchType }: { selectedSearchType: SearchType }) {
  const content = {
    date: {
      icon: "date" as const,
      title: "Standesämter nach Datum finden",
      text: "Wählt Monat, Jahr oder einen bevorzugten Wochentag. Die Ergebnisse dienen als Orientierung und müssen beim Amt bestätigt werden.",
      form: <DateSearchForm />
    },
    location: {
      icon: "location" as const,
      title: "Standesämter in meiner Nähe finden",
      text: "Sucht rund um euren Wohnort, euren Wunschort oder einen Kanton.",
      form: <LocationSearchForm />
    },
    style: {
      icon: "heart" as const,
      title: "Schöne Trauorte entdecken",
      text: "Entdeckt Standesämter nach Stil, Landschaft oder Stimmung.",
      form: <StyleSearchForm />
    }
  }[selectedSearchType];

  return (
    <section className="rounded-2xl border border-linen bg-white p-5 shadow-soft sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <Icon type={content.icon} />
          <h2 className="mt-4 text-3xl font-semibold text-ink">{content.title}</h2>
          <p className="mt-3 text-sm leading-6 text-soft-ink">{content.text}</p>
        </div>
        {content.form}
      </div>
    </section>
  );
}

export function HomeHeroSearchClient() {
  const [selectedSearchType, setSelectedSearchType] = useState<SearchType | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectSearchType = (type: SearchType) => {
    setSelectedSearchType(type);
    window.setTimeout(() => {
      const panelTop = panelRef.current?.getBoundingClientRect().top;
      if (typeof panelTop === "number" && window.innerWidth < 768) {
        window.scrollTo({ top: window.scrollY + panelTop - 96, behavior: "smooth" });
      }
    }, 80);
  };

  return (
    <div className="mt-8 grid gap-5">
      <SearchEntryCards selectedSearchType={selectedSearchType} onSelect={selectSearchType} />
      <div ref={panelRef}>{selectedSearchType ? <ExpandedSearchPanel selectedSearchType={selectedSearchType} /> : null}</div>
    </div>
  );
}
