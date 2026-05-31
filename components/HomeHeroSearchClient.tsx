"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { registryCantons } from "@/lib/registry-data";
import { repairText } from "@/lib/search-experience";
import type { Dictionary } from "@/lib/i18n";
import de from "@/locales/de.json";
import postalCodes from "switzerland-postal-codes/dist/postal-codes-full.json";

type SearchType = "date" | "location" | "style";
type PostalCodeEntry = { name: string; canton: string; latitude: string; longitude: string };

const postalCodeEntries = postalCodes as Record<string, PostalCodeEntry[]>;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, index) => String(currentYear + index));
const months = [["01", "Januar"], ["02", "Februar"], ["03", "März"], ["04", "April"], ["05", "Mai"], ["06", "Juni"], ["07", "Juli"], ["08", "August"], ["09", "September"], ["10", "Oktober"], ["11", "November"], ["12", "Dezember"]];
const tags = [
  ["featured", "tag.featured"],
  ["castle", "tag.castle"],
  ["lake", "tag.lake"],
  ["mountains", "tag.mountains"],
  ["historic", "tag.historic"],
  ["modern", "tag.modern"],
  ["romantic", "tag.romantic"],
  ["city", "tag.city"],
  ["nature", "tag.nature"]
];
const searchTypes = [
  { type: "date" as const, icon: "date" as const, titleKey: "search.date.title", textKey: "search.date.text" },
  { type: "location" as const, icon: "location" as const, titleKey: "search.location.title", textKey: "search.location.text" },
  { type: "style" as const, icon: "heart" as const, titleKey: "search.style.title", textKey: "search.style.text" }
];

function getPlaceFromPostalCode(value: string) {
  const code = value.trim().match(/^\d{4}$/)?.[0];
  const entry = code ? postalCodeEntries[code]?.[0] : undefined;
  return code && entry ? `${code} ${repairText(entry.name)}` : "";
}

function createTranslator(dictionary: Dictionary) {
  const fallback = de as Dictionary;
  return (key: string) => dictionary[key] ?? fallback[key] ?? key;
}

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

export function SearchTypeCard({ type, icon, titleKey, textKey, selected, onSelect, t }: {
  type: SearchType;
  icon: "date" | "location" | "heart";
  titleKey: string;
  textKey: string;
  selected: boolean;
  onSelect: (type: SearchType) => void;
  t: (key: string) => string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`focus-ring grid h-full gap-4 rounded-xl border bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-champagne ${selected ? "border-sage" : "border-linen"}`}
    >
      <Icon type={icon} />
      <div>
        <h2 className="text-2xl font-semibold text-ink">{t(titleKey)}</h2>
        <p className="mt-2 text-sm leading-6 text-soft-ink">{t(textKey)}</p>
      </div>
      <span className="mt-auto inline-flex justify-center rounded-lg bg-sage px-4 py-3 text-sm font-semibold text-white">{t("search.start")}</span>
    </button>
  );
}

export function SearchEntryCards({ selectedSearchType, onSelect, t }: {
  selectedSearchType: SearchType | null;
  onSelect: (type: SearchType) => void;
  t: (key: string) => string;
}) {
  return (
    <div className={`grid gap-4 ${selectedSearchType ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {searchTypes.map((item) => (
        <SearchTypeCard key={item.type} {...item} selected={selectedSearchType === item.type} onSelect={onSelect} t={t} />
      ))}
    </div>
  );
}

export function DateSearchForm({ t }: { t: (key: string) => string }) {
  return (
    <form action="/search" className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.month")}
          <select name="month" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">{t("search.monthPlaceholder")}</option>
            {months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.year")}
          <select name="year" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">{t("search.yearPlaceholder")}</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.weekday")}
          <select name="weekday" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="saturday">{t("search.saturday")}</option>
            <option value="friday">{t("search.friday")}</option>
            <option value="thursday">{t("search.thursday")}</option>
            <option value="any">{t("search.any")}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.dateOptional")}
          <input name="date" type="date" className="focus-ring h-12 rounded-lg border border-linen px-3 text-soft-ink" />
        </label>
      </div>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">{t("search.submitDate")}</button>
    </form>
  );
}

export function LocationSearchForm({ t }: { t: (key: string) => string }) {
  const [locationValue, setLocationValue] = useState("");
  const [locationHint, setLocationHint] = useState("");

  function handleLocationChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    const place = getPlaceFromPostalCode(nextValue);
    setLocationValue(place || nextValue);
    setLocationHint(place ? `${t("search.locationHint")}: ${place}` : "");
  }

  return (
    <form action="/search" className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-ink">
        {t("search.locationLabel")}
        <input name="location" value={locationValue} onChange={handleLocationChange} placeholder={t("search.locationPlaceholder")} className="focus-ring h-12 rounded-lg border border-linen px-3 text-soft-ink" />
        {locationHint ? <span className="text-xs font-medium text-sage">{locationHint}</span> : null}
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.radius")}
          <select name="radius" defaultValue="50" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.cantonOptional")}
          <select name="canton" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">{t("search.allCantons")}</option>
            {registryCantons.map((canton) => <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>)}
          </select>
        </label>
      </div>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">{t("search.submitLocation")}</button>
    </form>
  );
}

export function StyleSearchForm({ t }: { t: (key: string) => string }) {
  return (
    <form action="/search" className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {tags.map(([value, labelKey]) => (
          <label key={value} className="cursor-pointer">
            <input type="radio" name="tag" value={value} className="peer sr-only" />
            <span className="inline-flex rounded-full border border-linen bg-paper px-3 py-2 text-sm font-semibold text-soft-ink transition peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-white">{t(labelKey)}</span>
          </label>
        ))}
      </div>
      <label className="grid gap-2 text-sm font-medium text-ink">
        {t("search.regionOptional")}
        <select name="canton" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
          <option value="">{t("search.allRegions")}</option>
          {registryCantons.map((canton) => <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>)}
        </select>
      </label>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">{t("search.submitStyle")}</button>
    </form>
  );
}

export function ExpandedSearchPanel({ selectedSearchType, t }: { selectedSearchType: SearchType; t: (key: string) => string }) {
  const content = {
    date: { icon: "date" as const, title: t("search.datePanel.title"), text: t("search.datePanel.text"), form: <DateSearchForm t={t} /> },
    location: { icon: "location" as const, title: t("search.locationPanel.title"), text: t("search.locationPanel.text"), form: <LocationSearchForm t={t} /> },
    style: { icon: "heart" as const, title: t("search.stylePanel.title"), text: t("search.stylePanel.text"), form: <StyleSearchForm t={t} /> }
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

export function HomeHeroSearchClient({ dictionary }: { dictionary: Dictionary }) {
  const [selectedSearchType, setSelectedSearchType] = useState<SearchType | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const t = createTranslator(dictionary);

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
      <SearchEntryCards selectedSearchType={selectedSearchType} onSelect={selectSearchType} t={t} />
      <div ref={panelRef}>{selectedSearchType ? <ExpandedSearchPanel selectedSearchType={selectedSearchType} t={t} /> : null}</div>
    </div>
  );
}
