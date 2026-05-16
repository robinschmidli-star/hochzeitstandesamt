import { notFound } from "next/navigation";
import { ChecklistForm } from "@/components/LeadForm";
import { Disclaimer } from "@/components/Disclaimer";
import { Faq } from "@/components/Faq";
import { ceremonyVenues } from "@/lib/ceremony-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import { repairText } from "@/lib/search-experience";
import { createMetadata, faqSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return swissRegistryOffices.map((office) => ({ slug: office.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const office = swissRegistryOffices.find((item) => item.slug === slug);
  if (!office) return {};
  return createMetadata({
    title: `${repairText(office.name)} - Adresse, Kontakt & Gemeinden`,
    description: `Informationen zu ${repairText(office.name)}: Adresse, Kontakt, zuständige Gemeinden und nächste Schritte für die standesamtliche Trauung.`,
    path: `/zivilstandsamt/${office.slug}`
  });
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-semibold text-ink">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function httpsUrl(value?: string) {
  return value?.startsWith("https://") ? value : "";
}

function info(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "Keine Information verfügbar" : repairText(String(value));
}

function boolInfo(value?: boolean | null) {
  if (value === true) return "Ja";
  if (value === false) return "Nein";
  return "Keine Information verfügbar";
}

function ceremonyDays(source: {
  ceremonyMonday?: boolean | null;
  ceremonyTuesday?: boolean | null;
  ceremonyWednesday?: boolean | null;
  ceremonyThursday?: boolean | null;
  ceremonyFriday?: boolean | null;
  ceremonySaturday?: boolean | null;
  ceremonySunday?: boolean | null;
}) {
  return [
    ["Mo", source.ceremonyMonday],
    ["Di", source.ceremonyTuesday],
    ["Mi", source.ceremonyWednesday],
    ["Do", source.ceremonyThursday],
    ["Fr", source.ceremonyFriday],
    ["Sa", source.ceremonySaturday],
    ["So", source.ceremonySunday]
  ]
    .filter(([, value]) => value === true)
    .map(([day]) => day)
    .join(", ");
}

export default async function RegistryOfficeDetailPage({ params }: Props) {
  const { slug } = await params;
  const office = swissRegistryOffices.find((item) => item.slug === slug);
  if (!office) notFound();
  const cleanOffice = {
    ...office,
    name: repairText(office.name),
    cantonName: repairText(office.cantonName),
    city: repairText(office.city),
    addressLine1: repairText(office.addressLine1),
    postBox: repairText(office.postBox),
    mediaAlt: repairText(office.mediaAlt),
    responsibleMunicipalities: office.responsibleMunicipalities.map(repairText),
    ceremonyLocations: office.ceremonyLocations?.map(repairText)
  };
  const cleanVenues = ceremonyVenues
    .filter((venue) => venue.standesamt_id === office.id || venue.standesamt_id === office.slug)
    .map((venue) => ({
      ...venue,
      traulokal_name: repairText(venue.traulokal_name),
      adresse: repairText(venue.adresse),
      ort: repairText(venue.ort),
      beschreibung: repairText(venue.beschreibung),
      seasonalAvailability: repairText(venue.seasonalAvailability)
    }));
  const websiteUrl = httpsUrl(office.website_url) || httpsUrl(office.officialUrl);
  const marriageInfoUrl = httpsUrl(office.marriage_info_url) || websiteUrl;
  const appointmentUrl = httpsUrl(office.appointment_url) || httpsUrl(office.appointmentBookingUrl) || httpsUrl(office.onlineCalendarUrl);
  const officeVenues = cleanVenues;

  const faq = [
    {
      question: `Für welche Gemeinden ist ${cleanOffice.name} zuständig?`,
      answer: `${cleanOffice.name} ist in dieser Liste unter anderem für ${cleanOffice.responsibleMunicipalities.slice(0, 12).join(", ")} zuständig.`
    },
    {
      question: "Welche Dokumente brauche ich?",
      answer:
        "Das hängt von Wohnsitz, Nationalität und Zivilstand ab. Das zuständige Zivilstandsamt bestätigt die verbindliche Dokumentenliste."
    },
    {
      question: "Kann ich direkt einen Trautermin buchen?",
      answer:
        "In der Regel wird zuerst die Ehevorbereitung abgeschlossen. Danach kann der Termin mit dem Amt vereinbart werden."
    }
  ];

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faq)) }} />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{cleanOffice.cantonName} · {office.canton}</p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">{cleanOffice.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-soft-ink">
              Zuständiger Zivilstandskreis für Gemeinden in {cleanOffice.cantonName}. Prüfe die Angaben und kontaktiere das Amt für verbindliche Auskünfte.
            </p>
          </div>
          {office.coatOfArmsUrl ? (
            <figure className="rounded-xl border border-linen bg-white p-4 text-center shadow-soft">
              <img src={office.coatOfArmsUrl} alt={cleanOffice.mediaAlt || `Wappen ${cleanOffice.city}`} className="mx-auto h-24 w-24 object-contain" />
              <figcaption className="mt-2 text-xs text-soft-ink">Wappen</figcaption>
            </figure>
          ) : null}
        </section>

        <div className="rounded-xl border border-linen bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-ink">Kontakt</h2>
          <dl className="mt-4 grid gap-3 text-sm text-soft-ink">
            <InfoItem label="Adresse" value={`${cleanOffice.addressLine1 || cleanOffice.postBox}, ${office.postalCode} ${cleanOffice.city}`} />
            <InfoItem label="Postfach" value={cleanOffice.postBox} />
            <InfoItem label="Telefon" value={office.phone || "Nicht in der Liste enthalten"} />
            <InfoItem label="E-Mail" value={office.email || "Nicht in der Liste enthalten"} />
            <InfoItem label="Öffnungszeiten" value={info(office.openingHours)} />
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            {office.email ? (
              <a href={`mailto:${office.email}`} className="focus-ring inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage/90">
                E-Mail an Zivilstandsamt
              </a>
            ) : null}
            {websiteUrl ? (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                Website
              </a>
            ) : null}
            {marriageInfoUrl ? (
              <a href={marriageInfoUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                Trauung & Informationen
              </a>
            ) : null}
            {appointmentUrl ? (
              <a href={appointmentUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                Termin buchen
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <section className="grid gap-5 rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">Trauung & Zugänglichkeit</h2>
        <dl className="grid gap-4 text-sm text-soft-ink md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Mögliche Trautage" value={ceremonyDays(office) || "Keine Information verfügbar"} />
          <InfoItem label="Samstagstrauung" value={boolInfo(office.ceremonySaturday)} />
          <InfoItem label="Abendtrauung" value={boolInfo(office.eveningCeremonyAvailable)} />
          <InfoItem label="Trauung im Freien" value={boolInfo(office.outdoorCeremonyAvailable)} />
          <InfoItem label="Online-Terminbuchung" value={boolInfo(office.onlineAppointmentBookingAvailable)} />
          <InfoItem label="Direktlink Terminbuchung" value={appointmentUrl || "Keine Information verfügbar"} />
          <InfoItem label="Trauzeiten / Öffnungstage Traulokal" value={info(office.ceremonyTimes)} />
          <InfoItem label="Rollstuhlgängig" value={boolInfo(office.wheelchairAccessibleBoolean)} />
          <InfoItem label="Parkplätze" value={boolInfo(office.parkingAvailableBoolean)} />
          <InfoItem label="Max. Gästezahl Traulokal" value={info(office.maxCeremonyGuests)} />
          <InfoItem label="Mehrere Traulokale vorhanden" value={boolInfo(office.multipleCeremonyVenuesAvailable)} />
          <InfoItem label="Anzahl Traulokale" value={info(office.ceremonyVenueCount)} />
          <InfoItem label="Besonderheiten Traulokal" value={info(office.ceremonyVenueNotes)} />
          <InfoItem label="Saisonal verfügbar" value={info(office.ceremonyVenueSeasonalAvailability)} />
          <InfoItem label="Trauungen ausserhalb Bürozeiten" value={boolInfo(office.ceremoniesOutsideOfficeHours)} />
          <InfoItem label="Bemerkungen Trauungen" value={info(office.ceremonyRemarks)} />
        </dl>
        {cleanOffice.ceremonyLocations?.length || officeVenues.length ? (
          <div>
            <h3 className="font-semibold text-ink">Traulokale</h3>
            {cleanOffice.ceremonyLocations?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {cleanOffice.ceremonyLocations.map((location) => (
                  <span key={location} className="rounded-full bg-linen px-3 py-1 text-sm text-soft-ink">
                    {location}
                  </span>
                ))}
              </div>
            ) : null}
            {officeVenues.length ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {officeVenues.map((venue) => {
                  const venueDays = ceremonyDays(venue) || "Keine Information verfügbar";
                  return (
                    <article key={`${venue.standesamt_id}-${venue.traulokal_name}`} className="rounded-lg border border-linen bg-linen/40 p-4">
                      {venue.imageUrl ? <img src={venue.imageUrl} alt={venue.traulokal_name} className="mb-4 h-40 w-full rounded-lg object-cover" loading="lazy" /> : null}
                      <h4 className="font-semibold text-ink">{venue.traulokal_name}</h4>
                      <dl className="mt-3 grid gap-3 text-sm text-soft-ink">
                        <InfoItem label="Adresse" value={info([venue.adresse, venue.ort].filter(Boolean).join(", "))} />
                        <InfoItem label="Beschreibung" value={info(venue.beschreibung)} />
                        <InfoItem label="Mögliche Trautage" value={venueDays} />
                        <InfoItem label="Max. Gästezahl" value={info(venue.maxCeremonyGuests)} />
                        <InfoItem label="Rollstuhlgängig" value={boolInfo(venue.wheelchairAccessible)} />
                        <InfoItem label="Parkplätze" value={boolInfo(venue.parkingAvailable)} />
                        <InfoItem label="Trauung im Freien" value={boolInfo(venue.outdoorCeremonyAvailable)} />
                        <InfoItem label="Saisonale Nutzung" value={info(venue.seasonalAvailability)} />
                      </dl>
                      {httpsUrl(venue.venueUrl) ? (
                        <a href={venue.venueUrl} target="_blank" rel="noopener noreferrer" className="focus-ring mt-4 inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                          Traulokal ansehen
                        </a>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-soft-ink">Zu Traulokalen sind aktuell keine Informationen hinterlegt.</p>
        )}
      </section>

      {office.imageUrl ? (
        <figure className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
          <img src={office.imageUrl} alt={`${cleanOffice.name}`} className="h-72 w-full object-cover" loading="lazy" />
        </figure>
      ) : null}

      <section className="grid gap-5 rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">Zuständige Gemeinden</h2>
        <div className="flex flex-wrap gap-2">
          {cleanOffice.responsibleMunicipalities.map((municipality) => (
            <span key={municipality} className="rounded-full bg-linen px-3 py-1 text-sm text-soft-ink">
              {municipality}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-linen bg-linen/70 p-6">
          <h2 className="text-2xl font-semibold text-ink">Nächste Schritte</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-soft-ink">
            <li>1. Prüfe, ob eure Gemeinde diesem Zivilstandskreis zugeordnet ist.</li>
            <li>2. Kontaktiere das Amt und frage die persönliche Dokumentenliste an.</li>
            <li>3. Plane genug Zeit für ausländische Dokumente, Übersetzungen oder Beglaubigungen ein.</li>
            <li>4. Vereinbare den Trautermin erst, wenn die Ehevorbereitung bestätigt ist.</li>
          </ol>
        </div>
        <ChecklistForm sourcePage={`/zivilstandsamt/${office.slug}`} officeSlug={office.slug} />
      </section>

      <Faq items={faq} />
      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">Güterstand & Ehevertrag</h2>
        <p className="mt-3 leading-7 text-soft-ink">
          Vor der Hochzeit kann es sinnvoll sein, die finanziellen Folgen der Ehe und mögliche Eheverträge zu verstehen.
        </p>
        <a href="/ratgeber/gueterstand-ehevertrag-schweiz" className="focus-ring mt-5 inline-flex rounded-lg border border-sage/15 px-5 py-3 font-semibold text-sage transition hover:border-sage/30">
          Ratgeber öffnen
        </a>
      </section>
      <Disclaimer />
    </main>
  );
}

