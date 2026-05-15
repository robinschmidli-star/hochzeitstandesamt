import { registryCantons } from "@/lib/registry-data";

export function SearchForm({ compact = false, embedded = false }: { compact?: boolean; embedded?: boolean }) {
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const flexibilities = ["Fixes Datum", "± 1 Woche", "± 1 Monat", "Noch offen"];

  return (
    <form
      action="/standesamt-finden"
      className={`grid gap-4 ${
        embedded ? "" : "rounded-xl border border-linen bg-white p-4 shadow-soft"
      }`}
    >
      <div className={`grid gap-3 ${compact ? "lg:grid-cols-[1fr_1.25fr_2fr]" : "lg:grid-cols-4"}`}>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Kanton
          <select name="canton" className="focus-ring h-12 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">Alle Kantone</option>
            {registryCantons.map((canton) => (
              <option key={canton.code} value={canton.code}>
                {canton.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Stadt oder Gemeinde
          <input
            name="query"
            inputMode="search"
            placeholder="z.B. Winterthur oder 8400"
            className="focus-ring h-12 rounded-lg border border-linen px-3 text-soft-ink"
          />
        </label>
        <fieldset className="grid gap-2 text-sm font-medium text-ink">
          <legend>Gewünschter Zeitraum</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <input name="dateStart" type="date" aria-label="Von" className="focus-ring h-12 rounded-lg border border-linen px-3 text-soft-ink" />
            <input name="dateEnd" type="date" aria-label="Bis" className="focus-ring h-12 rounded-lg border border-linen px-3 text-soft-ink" />
          </div>
        </fieldset>
      </div>
      {!compact ? (
        <label className="grid gap-2 text-sm font-medium text-ink">
          E-Mail für Checkliste
          <input
            name="email"
            type="email"
            placeholder="name@example.ch"
            className="focus-ring rounded-lg border border-linen px-3 py-3 text-soft-ink"
          />
        </label>
      ) : null}
      <div className="grid gap-4 border-t border-linen pt-4 lg:grid-cols-[1fr_1.45fr]">
        <fieldset className="grid gap-2 text-sm font-medium text-ink">
          <legend>Bevorzugte Trautage</legend>
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
        <fieldset className="grid gap-2 text-sm font-medium text-ink">
          <legend>Flexibilität</legend>
          <div className="flex flex-wrap gap-2">
            {flexibilities.map((flexibility) => (
              <label key={flexibility} className="cursor-pointer">
                <input type="radio" name="dateFlexibility" value={flexibility} className="peer sr-only" />
                <span className="inline-flex rounded-full border border-linen bg-white px-3 py-2 text-sm font-semibold text-soft-ink transition peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-white">
                  {flexibility}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <button name="submitted" value="1" className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
        Standesamt finden
      </button>
    </form>
  );
}
