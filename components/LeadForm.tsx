import { registryCantons } from "@/lib/registry-data";
import { repairText } from "@/lib/search-experience";
import type { Dictionary, Locale } from "@/lib/i18n";

export function ChecklistForm({ sourcePage, officeSlug, dictionary, locale = "de" }: { sourcePage: string; officeSlug?: string; dictionary?: Dictionary; locale?: Locale }) {
  const t = (key: string, fallback: string) => dictionary?.[key] ?? fallback;
  return (
    <form action="/api/leads" method="post" className="grid gap-3 rounded-xl border border-linen bg-white p-5 shadow-soft">
      <input type="hidden" name="leadType" value="checklist" />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      {officeSlug ? <input type="hidden" name="registryOfficeSlug" value={officeSlug} /> : null}
      <h2 className="text-xl font-semibold text-ink">{t("checklist.title", "Kostenlose Checkliste erhalten")}</h2>
      <p className="text-sm leading-6 text-soft-ink">
        {t("checklist.description", "Erhalte die wichtigsten Schritte für Dokumente, Terminplanung und Vorbereitung der Ziviltrauung.")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          {t("checklist.firstName", "Vorname")}
          <input name="firstName" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          E-Mail
          <input name="email" type="email" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-2 text-sm font-medium sm:col-span-2">
          {t("checklist.canton", "Kanton")}
          <select name="cantonSlug" className="focus-ring w-full min-w-0 rounded-lg border border-linen px-3 py-3">
            <option value="">{t("checklist.open", "Offen")}</option>
            {registryCantons.map((canton) => (
              <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-medium">
          {t("checklist.dateOptional", "Datum optional")}
          <input name="weddingDate" type="date" className="focus-ring w-full min-w-0 rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-medium">
          {t("checklist.language", "Sprache")}
          <select name="language" defaultValue={locale.toUpperCase()} className="focus-ring w-full min-w-0 rounded-lg border border-linen px-3 py-3">
            <option>DE</option>
            <option>FR</option>
            <option>IT</option>
            <option>EN</option>
          </select>
        </label>
      </div>
      <label className="flex gap-3 text-sm text-soft-ink">
        <input required name="consentPrivacy" type="checkbox" className="mt-1 h-4 w-4" />
        {t("checklist.consent", "Ich akzeptiere die Datenschutzerklärung und bin einverstanden, dass meine Angaben zur Bearbeitung dieser Anfrage gespeichert werden.")}
      </label>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
        {t("checklist.submit", "Kostenlose Checkliste erhalten")}
      </button>
    </form>
  );
}
export function VendorRequestForm({ sourcePage }: { sourcePage: string }) {
  const categories = ["Location", "Fotograf", "Florist", "Ringe", "Catering", "DJ / Musik", "Hochzeitsplaner", "Make-up / Hair"];

  return (
    <form action="/api/leads" method="post" className="grid gap-4 rounded-xl border border-linen bg-white p-5 shadow-soft">
      <input type="hidden" name="leadType" value="vendor_request" />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <h2 className="text-xl font-semibold text-ink">Passende Anbieter finden</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="firstName" required placeholder="Vorname" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        <input name="email" type="email" required placeholder="E-Mail" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        <input name="city" placeholder="Region / Stadt" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        <input name="guestCount" type="number" placeholder="Gaestezahl" className="focus-ring rounded-lg border border-linen px-3 py-3" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <label key={category} className="flex gap-2 text-sm text-soft-ink">
            <input name="requestedVendorCategories" value={category} type="checkbox" />
            {category}
          </label>
        ))}
      </div>
      <textarea name="message" placeholder="Was ist euch wichtig?" className="focus-ring min-h-28 rounded-lg border border-linen px-3 py-3" />
      <label className="flex gap-3 text-sm text-soft-ink">
        <input required name="consentPrivacy" type="checkbox" className="mt-1 h-4 w-4" />
        Ich akzeptiere die Datenschutzerklärung und stimme der Kontaktaufnahme zur Anbieterempfehlung zu.
      </label>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">Passende Anbieter finden</button>
    </form>
  );
}
