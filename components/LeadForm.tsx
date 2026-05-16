import { registryCantons } from "@/lib/registry-data";
import { repairText } from "@/lib/search-experience";

export function ChecklistForm({ sourcePage, officeSlug }: { sourcePage: string; officeSlug?: string }) {
  return (
    <form action="/api/leads" method="post" className="grid gap-3 rounded-xl border border-linen bg-white p-5 shadow-soft">
      <input type="hidden" name="leadType" value="checklist" />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      {officeSlug ? <input type="hidden" name="registryOfficeSlug" value={officeSlug} /> : null}
      <h2 className="text-xl font-semibold text-ink">Kostenlose Checkliste erhalten</h2>
      <p className="text-sm leading-6 text-soft-ink">
        Erhalte die wichtigsten Schritte für Dokumente, Terminplanung und Vorbereitung der Ziviltrauung.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Vorname
          <input name="firstName" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          E-Mail
          <input name="email" type="email" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          Kanton
          <select name="cantonSlug" className="focus-ring rounded-lg border border-linen px-3 py-3">
            <option value="">Offen</option>
            {registryCantons.map((canton) => (
              <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Datum optional
          <input name="weddingDate" type="date" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Sprache
          <select name="language" className="focus-ring rounded-lg border border-linen px-3 py-3">
            <option>DE</option>
            <option>FR</option>
            <option>IT</option>
            <option>EN</option>
          </select>
        </label>
      </div>
      <label className="flex gap-3 text-sm text-soft-ink">
        <input required name="consentPrivacy" type="checkbox" className="mt-1 h-4 w-4" />
        Ich akzeptiere die Datenschutzerklärung und bin einverstanden, dass meine Angaben zur Bearbeitung dieser Anfrage gespeichert werden.
      </label>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
        Kostenlose Checkliste erhalten
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

export function FamilyLawLeadForm({ sourcePage }: { sourcePage: string }) {
  const topics = [
    "Ehevertrag",
    "Gütertrennung",
    "Gütergemeinschaft",
    "Immobilien / Wohneigentum",
    "Vermögen vor der Ehe",
    "Erbschaft / Nachlass",
    "Internationale Ehe",
    "Allgemeine Beratung"
  ];

  return (
    <form id="ersteinschaetzung" action="/api/leads" method="post" className="grid gap-5 rounded-xl border border-linen bg-white p-5 shadow-soft">
      <input type="hidden" name="leadType" value="family_law" />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Regionale Kontaktvermittlung</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Passende Familienrechtsanwälte in eurer Region finden</h2>
        <p className="mt-3 text-sm leading-6 text-soft-ink">
          Sende uns deine Angaben. Wir prüfen deine Region und dein Anliegen und senden dir passende Kontaktinformationen von erfahrenen
          Familienrechtsanwältinnen, Familienrechtsanwälten oder Notaren in deiner Nähe.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Vorname
          <input name="firstName" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Nachname
          <input name="lastName" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          E-Mail
          <input name="email" type="email" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Telefonnummer optional
          <input name="phone" type="tel" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Wohnort / Adresse
          <input name="address" required className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Kanton
          <select name="canton" required className="focus-ring rounded-lg border border-linen px-3 py-3">
            <option value="">Bitte auswählen</option>
            {registryCantons.map((canton) => (
              <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Geplanter Ort der Heirat / Standesamt
          <input name="weddingLocation" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Geplantes Hochzeitsdatum optional
          <input name="weddingDate" type="date" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Anliegen
          <select name="legalTopic" required className="focus-ring rounded-lg border border-linen px-3 py-3">
            <option value="">Bitte auswählen</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Beschreibt kurz eure Situation
          <textarea name="message" rows={5} className="focus-ring rounded-lg border border-linen px-3 py-3" />
        </label>
      </div>
      <div className="rounded-xl border border-champagne/30 bg-paper p-4 text-sm leading-6 text-soft-ink">
        hochzeitstandesamt.ch bietet keine Rechtsberatung. Die Anfrage dient dazu, passende regionale Ansprechpartner zu vermitteln.
      </div>
      <label className="flex gap-3 text-sm text-soft-ink">
        <input required name="consentPrivacy" type="checkbox" className="mt-1 h-4 w-4" />
        Ich bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert werden.
      </label>
      <label className="flex gap-3 text-sm text-soft-ink">
        <input required name="consentForwarding" type="checkbox" className="mt-1 h-4 w-4" />
        Ich bin damit einverstanden, dass meine Angaben zur Vermittlung passender Kontakte an geeignete Familienrechtsanwälte, Notare oder Kanzleien weitergeleitet werden dürfen.
      </label>
      <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
        Anfrage absenden
      </button>
    </form>
  );
}
