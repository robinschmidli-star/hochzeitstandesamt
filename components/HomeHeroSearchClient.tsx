import { NameSearch } from "@/components/NameSearch";
import { SearchDateFields } from "@/components/SearchDateFields";
import { repairText, type SearchParams } from "@/lib/search-experience";
import { registryCantons } from "@/lib/registry-data";
import type { Dictionary } from "@/lib/i18n";

export function HomeHeroSearchClient({ dictionary, pathPrefix = "", params = {} }: { dictionary: Dictionary; pathPrefix?: string; params?: SearchParams }) {
  const t = (key: string) => dictionary[key] ?? key;
  const inputClass = "focus-ring h-12 min-w-0 w-full rounded-lg border border-linen bg-white px-3 text-soft-ink";
  const advanced = ["radius", "weekday", "tag", "saturdayOnly", "elopement", "wheelchair", "parking", "evening", "outdoor", "onlineBooking", "multipleVenues", "postalCode", "preferredWeekdays"] as const;
  return (
    <section className="mt-4 min-w-0 rounded-2xl bg-white p-4 shadow-soft sm:p-5">
      <h2 className="mb-3 text-xl font-semibold text-ink">{t("homeSearch.title")}</h2>
      <NameSearch key={JSON.stringify(params)} dictionary={dictionary} defaultValue={params.name} pathPrefix={pathPrefix} hiddenParams={{ submitted: "1" }} quickFilters={
        <div key="filters" className="grid gap-2">
          <details open={advanced.some((key) => params[key]) || undefined} className="group border-y border-linen">
            <summary className="focus-ring flex min-h-11 cursor-pointer list-none items-center justify-between py-2.5 text-sm font-semibold text-sage marker:hidden"><span>{t("homeSearch.moreFilters")}</span><span className="text-base transition-transform group-open:rotate-180">⌄</span></summary>
            <div className="grid gap-4 pb-2 pt-2">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
                  {t("search.radius")}
                  <select name="radius" defaultValue={params.radius || "50"} className={inputClass}>
                    {[10, 25, 50, 100].map((radius) => <option key={radius} value={radius}>{radius} km</option>)}
                  </select>
                </label>
                <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
                  {t("search.weekday")}
                  <select name="weekday" defaultValue={params.weekday || ""} className={inputClass}>
                    <option value="">{t("results.all")}</option>
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => <option key={day} value={day}>{t(`weekday.short.${day}`)}</option>)}
                  </select>
                </label>
                <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
                  {t("results.style")}
                  <select name="tag" defaultValue={params.tag || ""} className={inputClass}>
                    <option value="">{t("results.all")}</option>
                    {["featured", "castle", "lake", "mountains", "historic", "modern", "romantic", "city", "nature"].map((tag) => <option key={tag} value={tag}>{t(`tag.${tag}`)}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {[["saturdayOnly", "true", "results.saturdayOnly"], ["elopement", "true", "results.elopement"], ["wheelchair", "yes", "results.wheelchair"], ["parking", "yes", "results.parking"], ["evening", "yes", "results.evening"], ["outdoor", "yes", "results.outdoor"], ["onlineBooking", "yes", "results.onlineBooking"], ["multipleVenues", "yes", "results.multipleVenues"]].map(([name, value, label]) => (
                  <label key={name} className="cursor-pointer">
                    <input name={name} value={value} defaultChecked={params[name as keyof SearchParams] === value} type="checkbox" className="peer sr-only" />
                    <span className="inline-flex min-h-11 items-center rounded-full border border-linen bg-paper px-4 py-2 text-sm font-medium text-soft-ink transition peer-checked:border-sage peer-checked:bg-sage peer-checked:text-white">{t(label)}</span>
                  </label>
                ))}
              </div>
              {params.postalCode ? <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
                {t("discovery.postalCode")}
                <input name="postalCode" defaultValue={params.postalCode} className={inputClass} />
              </label> : null}
              {params.preferredWeekdays ? <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
                {t("registry.weekdays")}
                <input name="preferredWeekdays" defaultValue={params.preferredWeekdays} className={inputClass} />
              </label> : null}
            </div>
          </details>
        </div>
      }>
        <SearchDateFields key="dates" dictionary={dictionary} params={params} locale={pathPrefix.slice(1) || "de"} mainFilters={<>
          <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
            {t("homeSearch.guests")}
            <input name="maxGuests" defaultValue={params.maxGuests} type="number" min="1" max="1000" className={inputClass} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
            {t("registry.canton")}
            <select name="canton" defaultValue={params.canton || ""} className={inputClass}>
              <option value="">{t("search.allCantons")}</option>
              {registryCantons.map((canton) => <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>)}
            </select>
          </label>
        </>} />
      </NameSearch>
    </section>
  );
}
