import { notFound } from "next/navigation";
import Link from "next/link";
import { ChecklistForm } from "@/components/LeadForm";
import { TrackOnMount } from "@/components/Analytics";
import { headers } from "next/headers";
import { ResponsibleMunicipalities } from "@/components/ResponsibleMunicipalities";
import { SafeMediaFrame } from "@/components/SafeMediaFrame";
import { Disclaimer } from "@/components/Disclaimer";
import { Faq } from "@/components/Faq";
import { ceremonyVenuePath, publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import { ceremonyVenueMedia, registryOfficeMedia } from "@/lib/safe-media";
import { repairText } from "@/lib/search-experience";
import { breadcrumbSchema, createMetadata, faqSchema, registryOfficeSchema } from "@/lib/seo";
import { contentTranslations } from "@/lib/content-translations";
import { defaultLocale, getDictionary, hreflangForLocale, indexableLocales, isLocale, withLocalePath, type Dictionary, type Locale } from "@/lib/i18n";
import type { CeremonyVenue, SwissRegistryOffice } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return swissRegistryOffices.map((office) => ({ slug: office.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const office = swissRegistryOffices.find((item) => item.slug === slug);
  if (!office) return {};
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";
  const path = `/zivilstandsamt/${office.slug}`;
  const metadata = createMetadata({
    title: `${repairText(office.name)} - Adresse, Kontakt & Gemeinden`,
    description: `Informationen zu ${repairText(office.name)}: Adresse, Kontakt, zuständige Gemeinden und nächste Schritte für die standesamtliche Trauung.`,
    path: locale === defaultLocale ? path : `/${locale}${path}`
  });
  return {
    ...metadata,
    alternates: {
      canonical: locale === defaultLocale ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`,
      languages: {
        ...Object.fromEntries(indexableLocales.map((item) => [
          hreflangForLocale(item),
          item === defaultLocale ? `${baseUrl}${path}` : `${baseUrl}/${item}${path}`
        ])),
        "x-default": `${baseUrl}${path}`
      }
    }
  };
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

function info(value: string | number | null | undefined, dictionary: Dictionary) {
  return value === undefined || value === null || value === "" ? dictionary["common.noInformationAvailable"] : repairText(String(value));
}

function boolInfo(value: boolean | null | undefined, dictionary: Dictionary) {
  if (value === true) return dictionary["common.yes"];
  if (value === false) return dictionary["common.no"];
  return dictionary["common.noInformationAvailable"];
}

function ceremonyDays(source: {
  ceremonyMonday?: boolean | null;
  ceremonyTuesday?: boolean | null;
  ceremonyWednesday?: boolean | null;
  ceremonyThursday?: boolean | null;
  ceremonyFriday?: boolean | null;
  ceremonySaturday?: boolean | null;
  ceremonySunday?: boolean | null;
}, dictionary: Dictionary, includeNegative = false) {
  return [
    [dictionary["weekday.short.monday"], source.ceremonyMonday],
    [dictionary["weekday.short.tuesday"], source.ceremonyTuesday],
    [dictionary["weekday.short.wednesday"], source.ceremonyWednesday],
    [dictionary["weekday.short.thursday"], source.ceremonyThursday],
    [dictionary["weekday.short.friday"], source.ceremonyFriday],
    [dictionary["weekday.short.saturday"], source.ceremonySaturday],
    [dictionary["weekday.short.sunday"], source.ceremonySunday]
  ]
    .filter(([, value]) => value === true || (includeNegative && value === false))
    .map(([day, value]) => value === false ? `${day}: ${dictionary["common.no"]}` : day)
    .join(", ");
}

function isOfficeVenue(venue: CeremonyVenue, office: SwissRegistryOffice) {
  const venueAddress = repairText(venue.adresse).toLowerCase();
  const officeAddress = repairText(office.addressLine1).toLowerCase();
  const venueName = repairText(venue.traulokal_name).toLowerCase();
  return Boolean(
    (venueAddress && officeAddress && venueAddress === officeAddress) ||
    venueName.includes("zivilstandsamt") ||
    venueName.includes("standesamt")
  );
}

export default async function RegistryOfficeDetailPage({ params }: Props) {
  const { slug } = await params;
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = await getDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;
  const format = (key: string, values: Record<string, string>) =>
    Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), t(key));
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
  const matchingVenues = publicCeremonyVenues
    .filter((venue) => venue.standesamt_id === office.canonicalId || venue.standesamt_id === office.id || venue.standesamt_id === office.slug)
  const venueTranslations = await contentTranslations(
    "wedding_venue",
    matchingVenues.flatMap((venue) => venue.canonicalId ? [venue.canonicalId] : []),
    locale,
    "description"
  );
  const cleanVenues = matchingVenues
    .map((venue) => ({
      ...venue,
      traulokal_name: repairText(venue.traulokal_name),
      adresse: repairText(venue.adresse),
      ort: repairText(venue.ort),
      beschreibung: repairText(
        (venue.canonicalId && venueTranslations.get(venue.canonicalId)) || venue.beschreibung
      ),
      seasonalAvailability: repairText(venue.seasonalAvailability)
    }));
  const websiteUrl = httpsUrl(office.website_url) || httpsUrl(office.officialUrl);
  const marriageInfoUrl = httpsUrl(office.marriage_info_url) || websiteUrl;
  const appointmentUrl = httpsUrl(office.appointment_url) || httpsUrl(office.appointmentBookingUrl) || httpsUrl(office.onlineCalendarUrl);
  const officeVenues = cleanVenues;
  const hasOfficeVenue = officeVenues.some((venue) => isOfficeVenue(venue, office));
  const officeMedia = registryOfficeMedia(office);

  const faq = [
    {
      question: format("office.faq.municipalities.question", { office: cleanOffice.name }),
      answer: format("office.faq.municipalities.answer", { office: cleanOffice.name, municipalities: cleanOffice.responsibleMunicipalities.slice(0, 12).join(", ") })
    },
    {
      question: t("office.faq.documents.question"),
      answer: t("office.faq.documents.answer")
    },
    {
      question: t("office.faq.booking.question"),
      answer: t("office.faq.booking.answer")
    }
  ];

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <TrackOnMount eventName="location_view" properties={{ entityType: "civil_registry_office", entityId: office.canonicalId ?? office.id, canton: office.canton }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faq)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(registryOfficeSchema(cleanOffice, cleanVenues)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: t("nav.home"), url: `https://hochzeitstandesamt.ch${withLocalePath("/", locale)}` },
        { name: cleanOffice.name, url: `https://hochzeitstandesamt.ch/zivilstandsamt/${office.slug}` }
      ])) }} />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{cleanOffice.cantonName} · {office.canton}</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{cleanOffice.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-soft-ink">
              {format("office.intro", { canton: cleanOffice.cantonName })}
            </p>
          </div>
          {officeMedia ? (
            <figure className="rounded-xl border border-linen bg-white p-4 text-center shadow-soft">
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-lg">
                <SafeMediaFrame media={officeMedia} className="h-full w-full" imageClassName="h-full w-full" placeholderLabel={t("media.placeholder")} />
              </div>
              {officeMedia.status === "approved" ? <figcaption className="mt-2 text-xs text-soft-ink">{t("media.image")}</figcaption> : null}
            </figure>
          ) : null}
        </section>

        <div className="rounded-xl border border-linen bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-ink">{t("office.contact.title")}</h2>
          <dl className="mt-4 grid gap-3 text-sm text-soft-ink">
            <InfoItem label={t("office.field.address")} value={`${cleanOffice.addressLine1 || cleanOffice.postBox}, ${office.postalCode} ${cleanOffice.city}`} />
            <InfoItem label={t("office.field.postBox")} value={cleanOffice.postBox} />
            <InfoItem label={t("office.field.phone")} value={office.phone || t("common.notListed")} />
            <InfoItem label={t("office.field.email")} value={office.email || t("common.notListed")} />
            <InfoItem label={t("office.field.openingHours")} value={info(office.openingHours, dictionary)} />
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            {office.email ? (
              <a href={`mailto:${office.email}`} className="focus-ring inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage/90">
                {t("office.action.email")}
              </a>
            ) : null}
            {websiteUrl ? (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                {t("office.action.website")}
              </a>
            ) : null}
            {marriageInfoUrl ? (
              <a href={marriageInfoUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                {t("office.action.marriageInfo")}
              </a>
            ) : null}
            {appointmentUrl ? (
              <a href={appointmentUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                {t("office.action.book")}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <section className="grid gap-5 rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">{t("office.ceremony.title")}</h2>
        {hasOfficeVenue ? <p className="font-semibold text-sage">✓ {t("office.ceremony.atOffice")}</p> : null}
        <dl className="grid gap-4 text-sm text-soft-ink md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label={t("office.field.possibleWeddingDays")} value={ceremonyDays(office, dictionary) || t("common.noInformationAvailable")} />
          <InfoItem label={t("office.field.saturdayWedding")} value={boolInfo(office.ceremonySaturday, dictionary)} />
          <InfoItem label={t("office.field.eveningWedding")} value={boolInfo(office.eveningCeremonyAvailable, dictionary)} />
          <InfoItem label={t("office.field.onlineBooking")} value={boolInfo(office.onlineAppointmentBookingAvailable, dictionary)} />
          <InfoItem label={t("office.field.bookingLink")} value={appointmentUrl || t("common.noInformationAvailable")} />
          <InfoItem label={t("office.field.generalWeddingTimes")} value={info(office.ceremonyTimes, dictionary)} />
          <InfoItem label={t("office.field.outsideOfficeHours")} value={boolInfo(office.ceremoniesOutsideOfficeHours, dictionary)} />
          <InfoItem label={t("office.field.ceremonyRemarks")} value={info(office.ceremonyRemarks, dictionary)} />
        </dl>
        {!officeVenues.length ? (
          <div className="rounded-lg border border-linen bg-linen/40 p-4">
            <h3 className="font-semibold text-ink">{t("office.ceremony.offerDetails")}</h3>
            <p className="mt-1 text-sm text-soft-ink">{t("office.ceremony.unassignedDetails")}</p>
            <dl className="mt-3 grid gap-3 text-sm text-soft-ink md:grid-cols-2 lg:grid-cols-3">
              <InfoItem label={t("office.field.outdoorWedding")} value={boolInfo(office.outdoorCeremonyAvailable, dictionary)} />
              <InfoItem label={t("office.field.wheelchairAccessible")} value={boolInfo(office.wheelchairAccessibleBoolean, dictionary)} />
              <InfoItem label={t("office.field.parking")} value={boolInfo(office.parkingAvailableBoolean, dictionary)} />
              <InfoItem label={t("office.field.maxGuests")} value={info(office.maxCeremonyGuests, dictionary)} />
              <InfoItem label={t("office.field.specialFeatures")} value={info(office.ceremonyVenueNotes, dictionary)} />
              <InfoItem label={t("office.field.seasonalAvailability")} value={info(office.ceremonyVenueSeasonalAvailability, dictionary)} />
            </dl>
          </div>
        ) : null}
        {cleanOffice.ceremonyLocations?.length || officeVenues.length ? (
          <div id="trauorte" className="scroll-mt-24">
            <h3 className="text-xl font-semibold text-ink">{t("office.venues.title")}</h3>
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
                {officeVenues.map((venue, index) => {
                  const venueDays = ceremonyDays(venue, dictionary, true) || t("common.noInformationAvailable");
                  const venueMedia = ceremonyVenueMedia(venue);
                  return (
                    <article key={`${venue.standesamt_id}-${venue.traulokal_name}-${index}`} className="rounded-lg border border-linen bg-linen/40 p-4">
                      <div className="mb-4 h-40 overflow-hidden rounded-lg">
                        <SafeMediaFrame media={venueMedia} className="h-full w-full" placeholderLabel={t("media.placeholder")} />
                      </div>
                      <h4 className="font-semibold text-ink">
                        <Link href={withLocalePath(ceremonyVenuePath(venue), locale)} className="focus-ring rounded-sm transition hover:text-sage hover:underline">
                          {venue.traulokal_name}
                        </Link>
                      </h4>
                      <dl className="mt-3 grid gap-3 text-sm text-soft-ink">
                        <InfoItem label={t("office.field.address")} value={info([venue.adresse, venue.ort].filter(Boolean).join(", "), dictionary)} />
                        <InfoItem label={t("office.field.description")} value={info(venue.beschreibung, dictionary)} />
                        <InfoItem label={t("office.field.possibleWeddingDays")} value={venueDays} />
                        {venue.ceremonyDaysNote ? <InfoItem label={t("verification.field.conditions")} value={repairText(venue.ceremonyDaysNote)} /> : null}
                        {venue.ceremonyTimes ? <InfoItem label={t("verification.field.ceremony_times")} value={repairText(venue.ceremonyTimes)} /> : null}
                        <InfoItem label={t("office.field.maxGuests")} value={info(venue.maxCeremonyGuests, dictionary)} />
                        {venue.capacityNote ? <InfoItem label={t("verification.field.capacity_max")} value={repairText(venue.capacityNote)} /> : null}
                        <InfoItem label={t("office.field.wheelchairAccessible")} value={boolInfo(venue.wheelchairAccessible, dictionary)} />
                        <InfoItem label={t("office.field.parking")} value={venue.parkingDescription ? repairText(venue.parkingDescription) : boolInfo(venue.parkingAvailable, dictionary)} />
                        {venue.indoor != null ? <InfoItem label={t("verification.field.indoor")} value={boolInfo(venue.indoor, dictionary)} /> : null}
                        {venue.reservationRequired != null ? <InfoItem label={t("verification.field.reservation_required")} value={boolInfo(venue.reservationRequired, dictionary)} /> : null}
                        <InfoItem label={t("office.field.outdoorWedding")} value={boolInfo(venue.outdoorCeremonyAvailable, dictionary)} />
                        <InfoItem label={t("office.field.seasonalUse")} value={info(venue.seasonalAvailability, dictionary)} />
                      </dl>
                      <Link href={withLocalePath(ceremonyVenuePath(venue), locale)} className="focus-ring mt-4 inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">
                          {t("office.action.viewVenue")}
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-soft-ink">{t("office.venues.empty")}</p>
        )}
      </section>

      {officeMedia.status === "approved" ? (
        <figure className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
          <div className="h-72">
            <SafeMediaFrame media={officeMedia} className="h-full w-full" placeholderLabel={t("media.placeholder")} />
          </div>
        </figure>
      ) : null}

      <ResponsibleMunicipalities municipalities={cleanOffice.responsibleMunicipalities} dictionary={dictionary} locale={locale} />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-linen bg-linen/70 p-6">
          <h2 className="text-2xl font-semibold text-ink">{t("office.nextSteps.title")}</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-soft-ink">
            <li>1. {t("office.nextSteps.one")}</li>
            <li>2. {t("office.nextSteps.two")}</li>
            <li>3. {t("office.nextSteps.three")}</li>
            <li>4. {t("office.nextSteps.four")}</li>
          </ol>
        </div>
        <ChecklistForm sourcePage={withLocalePath(`/zivilstandsamt/${office.slug}`, locale)} officeSlug={office.slug} dictionary={dictionary} locale={locale} />
      </section>

      <Faq items={faq} />
      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">{t("office.marriageContract.title")}</h2>
        <p className="mt-3 leading-7 text-soft-ink">
          {t("office.marriageContract.description")}
        </p>
        <Link href="/ratgeber/gueterstand-ehevertrag-schweiz" hrefLang="de" className="focus-ring mt-5 inline-flex rounded-lg border border-sage/15 px-5 py-3 font-semibold text-sage transition hover:border-sage/30">
          {t("office.marriageContract.action")}
        </Link>
      </section>
      <Disclaimer dictionary={dictionary} />
    </main>
  );
}

