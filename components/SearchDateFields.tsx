import type { Dictionary } from "@/lib/i18n";
import type { SearchParams } from "@/lib/search-experience";

export function SearchDateFields({ dictionary, params = {}, locale = "de" }: {
  dictionary: Dictionary;
  params?: SearchParams;
  locale?: string;
}) {
  const year = new Date().getUTCFullYear();
  const years = Array.from(new Set([params.year, ...Array.from({ length: 4 }, (_, index) => String(year + index))].filter(Boolean))) as string[];
  const inputClass = "focus-ring h-12 min-w-0 w-full rounded-lg border border-linen bg-white px-3 text-soft-ink";
  return (
    <div className="grid min-w-0 gap-3">
      <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
        {dictionary["search.dateOptional"]}
        <input name="date" type="date" defaultValue={params.date} className={inputClass} />
      </label>
      <details open={params.month || params.year || params.dateStart || params.dateEnd ? true : undefined}>
        <summary className="focus-ring cursor-pointer py-2 text-sm font-semibold text-sage">{dictionary["registry.period"]}</summary>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
            {dictionary["search.month"]}
            <select name="month" defaultValue={params.month || ""} className={inputClass}>
              <option value="">{dictionary["search.monthPlaceholder"]}</option>
              {Array.from({ length: 12 }, (_, index) => <option key={index} value={String(index + 1).padStart(2, "0")}>{new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, index, 1)))}</option>)}
            </select>
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
            {dictionary["search.year"]}
            <select name="year" defaultValue={params.year || ""} className={inputClass}>
              <option value="">{dictionary["search.yearPlaceholder"]}</option>
              {years.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
            {dictionary["registry.from"]}
            <input name="dateStart" type="date" defaultValue={params.dateStart} className={inputClass} />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
            {dictionary["registry.until"]}
            <input name="dateEnd" type="date" defaultValue={params.dateEnd} className={inputClass} />
          </label>
        </div>
      </details>
      <p className="text-xs leading-5 text-soft-ink">{dictionary["homeSearch.dateHint"]}</p>
    </div>
  );
}
