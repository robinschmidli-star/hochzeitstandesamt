import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { repairText } from "@/lib/search-experience";
import { defaultRegistrySearchLabels, type RegistrySearchLabels } from "@/lib/registry-search-labels";
import { withLocalePath } from "@/lib/i18n";

const searchSuggestions = Array.from(
  new Set(
    swissRegistryOffices.flatMap((office) => [
      repairText(office.city),
      office.postalCode,
      `${office.postalCode} ${repairText(office.city)}`,
      ...office.responsibleMunicipalities.map(repairText)
    ])
  )
).sort((a, b) => a.localeCompare(b, "de-CH"));

export function SearchForm({ compact = false, embedded = false, labels = defaultRegistrySearchLabels }: { compact?: boolean; embedded?: boolean; labels?: RegistrySearchLabels }) {
  const weekdays = labels.weekdayNames;

  return (
    <form
      action={withLocalePath("/standesamt-finden", labels.locale)}
      className={`grid gap-4 ${
        embedded ? "" : "rounded-xl border border-linen bg-white p-4 shadow-soft"
      }`}
    >
      <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.55fr)_minmax(180px,240px)]">
        <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
          {labels.city}
          <input
            name="query"
            inputMode="search"
            list="registry-search-suggestions"
            placeholder={labels.cityPlaceholder}
            className="focus-ring h-12 w-full rounded-lg border border-linen px-3 text-soft-ink"
          />
          <datalist id="registry-search-suggestions">
            {searchSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </label>
        <fieldset className="min-w-0 text-sm font-medium text-ink">
          <legend className="mb-2">{labels.period}</legend>
          <div className="grid gap-2 min-[390px]:grid-cols-2">
            <input name="dateStart" type="date" aria-label={labels.from} className="focus-ring h-12 w-full rounded-lg border border-linen px-3 text-soft-ink" />
            <input name="dateEnd" type="date" aria-label={labels.until} className="focus-ring h-12 w-full rounded-lg border border-linen px-3 text-soft-ink" />
          </div>
        </fieldset>
        <button name="submitted" value="1" className="focus-ring h-12 rounded-lg bg-sage px-5 font-semibold text-white transition hover:bg-sage/90">
          {labels.submit}
        </button>
      </div>

      <details className="group rounded-lg border border-linen bg-paper/45 px-3 py-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-sage marker:hidden">
          {labels.filters}
          <span className="ml-1 text-soft-ink transition group-open:hidden">+</span>
          <span className="ml-1 hidden text-soft-ink transition group-open:inline">-</span>
        </summary>
        <div className="mt-3 grid gap-3 border-t border-linen pt-3">
          <div className="grid items-start gap-3 md:grid-cols-2">
            <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
              {labels.canton}
              <select name="canton" className="focus-ring h-12 w-full rounded-lg border border-linen bg-white px-3 text-soft-ink">
                <option value="">{labels.allCantons}</option>
                {registryCantons.map((canton) => (
                  <option key={canton.code} value={canton.code}>
                    {repairText(canton.name)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-2 text-sm font-medium text-ink">
              E-Mail für Checkliste (optional)
              <input
                name="email"
                type="email"
                placeholder="name@example.ch"
                className="focus-ring h-12 w-full rounded-lg border border-linen px-3 text-soft-ink"
              />
            </label>
            <label className="flex gap-3 text-sm leading-6 text-soft-ink md:col-span-2">
              <input name="marketingOptIn" type="checkbox" value="yes" className="mt-0.5 h-5 w-5 shrink-0 rounded border-linen accent-sage" />
              <span>Ich möchte passende Tipps und Angebote rund um meine Hochzeit per E-Mail erhalten. Ich kann mich jederzeit abmelden.</span>
            </label>
          </div>
          <fieldset className="grid gap-2 text-sm font-medium text-ink">
            <legend>{labels.weekdays}</legend>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => (
                <label key={day} className="cursor-pointer">
                  <input type="checkbox" name="preferredWeekdays" value={day} className="peer sr-only" />
                  <span className="inline-flex min-w-11 justify-center rounded-full border border-linen bg-white px-3 py-2 text-sm font-semibold text-soft-ink transition peer-checked:border-sage peer-checked:bg-sage peer-checked:text-white">
                    {day}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {!compact ? (
            <fieldset className="grid gap-2 text-sm font-medium text-ink">
              <legend>Flexibilität</legend>
              <div className="flex flex-wrap gap-2">
                {["Fixes Datum", "± 1 Woche", "± 1 Monat", "Noch offen"].map((flexibility) => (
                  <label key={flexibility} className="cursor-pointer">
                    <input type="radio" name="dateFlexibility" value={flexibility} className="peer sr-only" />
                    <span className="inline-flex rounded-full border border-linen bg-white px-3 py-2 text-sm font-semibold text-soft-ink transition peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-white">
                      {flexibility}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
        </div>
      </details>
    </form>
  );
}
