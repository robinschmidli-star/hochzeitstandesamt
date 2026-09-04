"use client";

import { useState, type ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { SearchParams } from "@/lib/search-experience";

export function SearchDateFields({ dictionary, params = {}, locale = "de", mainFilters }: {
  dictionary: Dictionary;
  params?: SearchParams;
  locale?: string;
  mainFilters?: ReactNode;
}) {
  const year = new Date().getUTCFullYear();
  const years = Array.from(new Set([params.year, ...Array.from({ length: 4 }, (_, index) => String(year + index))].filter(Boolean))) as string[];
  const [mode, setMode] = useState<"exact" | "flexible">(params.dateStart || params.dateEnd || params.month || params.year ? "flexible" : "exact");
  const [flexibleMode, setFlexibleMode] = useState<"month" | "range">(params.month || params.year ? "month" : "range");
  const inputClass = "focus-ring h-12 min-w-0 w-full rounded-lg border border-linen bg-white px-3 text-soft-ink";
  const choiceClass = "block cursor-pointer px-3 py-2 text-center text-sm font-medium text-soft-ink transition peer-checked:bg-sage peer-checked:text-white";

  return (
    <fieldset className="grid min-w-0 gap-2 pt-1">
      <legend className="mb-2 text-sm font-semibold text-ink">{dictionary["homeSearch.when"]}</legend>
      <div className="inline-grid w-full max-w-md grid-cols-2 overflow-hidden rounded-lg border border-linen bg-paper sm:w-auto">
        <label><input className="peer sr-only" type="radio" name="dateMode" checked={mode === "exact"} onChange={() => setMode("exact")} /><span className={choiceClass}>{dictionary["homeSearch.exactDate"]}</span></label>
        <label className="border-l border-linen"><input className="peer sr-only" type="radio" name="dateMode" checked={mode === "flexible"} onChange={() => setMode("flexible")} /><span className={choiceClass}>{dictionary["homeSearch.flexibleDate"]}</span></label>
      </div>
      <div className="mt-1 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(140px,.7fr)_minmax(180px,1fr)]">
        {mode === "exact" ? (
          <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
            {dictionary["homeSearch.date"]}
            <input name="date" type="date" defaultValue={params.date} className={inputClass} />
          </label>
        ) : (
          <div className="grid min-w-0 gap-2">
            <div className="inline-grid w-full grid-cols-2 overflow-hidden rounded-lg border border-linen bg-paper">
              <label><input className="peer sr-only" type="radio" name="flexibleMode" checked={flexibleMode === "month"} onChange={() => setFlexibleMode("month")} /><span className={choiceClass}>{dictionary["homeSearch.monthYear"]}</span></label>
              <label className="border-l border-linen"><input className="peer sr-only" type="radio" name="flexibleMode" checked={flexibleMode === "range"} onChange={() => setFlexibleMode("range")} /><span className={choiceClass}>{dictionary["homeSearch.dateRange"]}</span></label>
            </div>
            {flexibleMode === "month" ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="sr-only" htmlFor="search-month">{dictionary["search.month"]}</label>
                <select id="search-month" name="month" defaultValue={params.month || ""} className={inputClass}>
                  <option value="">{dictionary["search.monthPlaceholder"]}</option>
                  {Array.from({ length: 12 }, (_, index) => <option key={index} value={String(index + 1).padStart(2, "0")}>{new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, index, 1)))}</option>)}
                </select>
                <label className="sr-only" htmlFor="search-year">{dictionary["search.year"]}</label>
                <select id="search-year" name="year" defaultValue={params.year || ""} className={inputClass}>
                  <option value="">{dictionary["search.yearPlaceholder"]}</option>
                  {years.map((value) => <option key={value}>{value}</option>)}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input aria-label={dictionary["registry.from"]} name="dateStart" type="date" defaultValue={params.dateStart} className={inputClass} />
                <input aria-label={dictionary["registry.until"]} name="dateEnd" type="date" defaultValue={params.dateEnd} className={inputClass} />
              </div>
            )}
          </div>
        )}
        {mainFilters}
      </div>
      <p className="mt-0.5 text-[11px] leading-4 text-soft-ink/80">ⓘ {dictionary["homeSearch.dateHint"]}</p>
    </fieldset>
  );
}
