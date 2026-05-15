import { notFound } from "next/navigation";
import { ChecklistForm } from "@/components/LeadForm";
import { Disclaimer } from "@/components/Disclaimer";
import { Faq } from "@/components/Faq";
import { swissRegistryOffices } from "@/lib/registry-data";
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
    title: `${office.name} - Adresse, Kontakt & Gemeinden`,
    description: `Informationen zu ${office.name}: Adresse, Kontakt, zuständige Gemeinden und nächste Schritte für die standesamtliche Trauung.`,
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

export default async function RegistryOfficeDetailPage({ params }: Props) {
  const { slug } = await params;
  const office = swissRegistryOffices.find((item) => item.slug === slug);
  if (!office) notFound();

  const faq = [
    {
      question: `Für welche Gemeinden ist ${office.name} zuständig?`,
      answer: `${office.name} ist in dieser Liste unter anderem für ${office.responsibleMunicipalities.slice(0, 12).join(", ")} zuständig.`
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
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{office.cantonName} · {office.canton}</p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">{office.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-soft-ink">
              Zuständiger Zivilstandskreis für Gemeinden in {office.cantonName}. Prüfe die Angaben und kontaktiere das Amt für verbindliche Auskünfte.
            </p>
          </div>
          {office.coatOfArmsUrl ? (
            <figure className="rounded-xl border border-linen bg-white p-4 text-center shadow-soft">
              <img src={office.coatOfArmsUrl} alt={office.mediaAlt || `Wappen ${office.city}`} className="mx-auto h-24 w-24 object-contain" />
              <figcaption className="mt-2 text-xs text-soft-ink">Wappen</figcaption>
            </figure>
          ) : null}
        </section>

        <div className="rounded-xl border border-linen bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-ink">Kontakt</h2>
          <dl className="mt-4 grid gap-3 text-sm text-soft-ink">
            <InfoItem label="Adresse" value={`${office.addressLine1 || office.postBox}, ${office.postalCode} ${office.city}`} />
            <InfoItem label="Postfach" value={office.postBox} />
            <InfoItem label="Telefon" value={office.phone || "Nicht in der Liste enthalten"} />
            <InfoItem label="E-Mail" value={office.email || "Nicht in der Liste enthalten"} />
            <InfoItem label="Öffnungszeiten" value={office.openingHours} />
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            {office.email ? (
              <a href={`mailto:${office.email}`} className="focus-ring inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage/90">
                E-Mail an Zivilstandsamt
              </a>
            ) : null}
            {office.officialUrl ? (
              <a href={office.officialUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                Website öffnen
              </a>
            ) : null}
            {office.onlineCalendarUrl ? (
              <a href={office.onlineCalendarUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                Online-Kalender öffnen
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <section className="grid gap-5 rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">Trauung & Zugänglichkeit</h2>
        <dl className="grid gap-4 text-sm text-soft-ink md:grid-cols-2">
          <InfoItem label="Online-Kalender vorhanden" value={office.onlineCalendarAvailable || "Keine Informationen"} />
          <InfoItem label="Trauzeiten / Öffnungstage Traulokal" value={office.ceremonyTimes || "Keine Informationen"} />
          <InfoItem label="Rollstuhlgängig" value={office.wheelchairAccessible || "Keine Informationen"} />
          <InfoItem label="Parkplätze" value={office.parking || "Keine Informationen"} />
        </dl>
        {office.ceremonyLocations?.length ? (
          <div>
            <h3 className="font-semibold text-ink">Traulokale</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {office.ceremonyLocations.map((location) => (
                <span key={location} className="rounded-full bg-linen px-3 py-1 text-sm text-soft-ink">
                  {location}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-soft-ink">Zu Traulokalen sind aktuell keine Informationen hinterlegt.</p>
        )}
      </section>

      {office.imageUrl ? (
        <figure className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
          <img src={office.imageUrl} alt={`${office.name}`} className="h-72 w-full object-cover" loading="lazy" />
        </figure>
      ) : null}

      <section className="grid gap-5 rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">Zuständige Gemeinden</h2>
        <div className="flex flex-wrap gap-2">
          {office.responsibleMunicipalities.map((municipality) => (
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
