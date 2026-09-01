import { NameSearch } from "@/components/NameSearch";
import { SearchDateFields } from "@/components/SearchDateFields";
import { repairText, type SearchParams } from "@/lib/search-experience";
import { registryCantons } from "@/lib/registry-data";
import type { Dictionary } from "@/lib/i18n";

export function HomeHeroSearchClient({ dictionary, pathPrefix = "", params = {} }: { dictionary: Dictionary; pathPrefix?: string; params?: SearchParams }) {
  const t = (key: string) => dictionary[key] ?? key;
  const inputClass = "focus-ring h-12 min-w-0 w-full rounded-lg border border-linen bg-white px-3 text-soft-ink";
  const advanced = ["location", "weekday", "tag", "elopement", "wheelchair", "parking", "evening", "outdoor", "onlineBooking", "multipleVenues", "postalCode", "preferredWeekdays"] as const;
  return (
    <section className="mt-5 min-w-0 rounded-2xl border border-linen bg-white p-4 shadow-soft sm:p-6">
      <NameSearch key={JSON.stringify(params)} dictionary={dictionary} defaultValue={params.name} pathPrefix={pathPrefix} hiddenParams={{ submitted: "1" }} quickFilters={
        <div key="filters" className="grid gap-3">
          <div className="grid min-w-0 gap-3 sm:grid-cols-3">
            <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
              {t("search.cantonOptional")}
              <select name="canton" defaultValue={params.canton || ""} className={inputClass}>
                <option value="">{t("search.allCantons")}</option>
                {registryCantons.map((canton) => <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>)}
              </select>
            </label>
            <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
              {t("results.minimumGuests")}
              <input name="maxGuests" defaultValue={params.maxGuests} type="number" min="1" max="1000" className={inputClass} />
            </label>
            <label className="flex min-h-12 cursor-pointer items-center gap-2 self-end rounded-lg border border-linen px-3 py-2 text-sm text-soft-ink">
              <input name="saturdayOnly" value="true" defaultChecked={params.saturdayOnly === "true"} type="checkbox" className="h-5 w-5 shrink-0 accent-sage" />
              {t("results.saturdayOnly")}
            </label>
          </div>
          <details open={advanced.some((key) => params[key]) || undefined} className="rounded-lg border border-linen px-3">
            <summary className="focus-ring min-h-11 cursor-pointer py-3 text-sm font-semibold text-sage">{t("homeSearch.moreFilters")}</summary>
            <div className="grid gap-4 pb-4">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
                  {t("search.locationLabel")}
                  <input name="location" defaultValue={params.location} placeholder={t("search.locationPlaceholder")} className={inputClass} />
                </label>
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
                {[["elopement", "true", "results.elopement"], ["wheelchair", "yes", "results.wheelchair"], ["parking", "yes", "results.parking"], ["evening", "yes", "results.evening"], ["outdoor", "yes", "results.outdoor"], ["onlineBooking", "yes", "results.onlineBooking"], ["multipleVenues", "yes", "results.multipleVenues"]].map(([name, value, label]) => (
                  <label key={name} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-linen px-3 py-2 text-sm text-soft-ink">
                    <input name={name} value={value} defaultChecked={params[name as keyof SearchParams] === value} type="checkbox" className="h-5 w-5 shrink-0 accent-sage" />
                    {t(label)}
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
              <button className="focus-ring min-h-12 justify-self-start rounded-lg bg-sage px-5 py-3 font-semibold text-white">{t("results.applyFilters")}</button>
            </div>
          </details>
        </div>
      }>
        <SearchDateFields key="dates" dictionary={dictionary} params={params} locale={pathPrefix.slice(1) || "de"} />
      </NameSearch>
    </section>
  );
}
