import { prisma } from "@/lib/prisma";

export const availabilityMvpSources = [
  {
    targetType: "venue",
    targetCanonicalId: null,
    targetSlug: "schloss-spiez",
    providerType: "html",
    sourceUrl: "https://www.zivilstand.sid.be.ch/de/start/heirat/externe-trauungslokale/schloss-spiez.html",
    connectorKey: "official-published-dates-html",
    sourceQuality: "official_webpage",
    active: true,
    syncFrequencyMinutes: 1440,
    metadata: { mvp: true, jurisdiction: "BE", office: "Zivilstandsamt Oberland West" },
  },
  {
    targetType: "venue",
    targetCanonicalId: null,
    targetSlug: "schloss-oberhofen",
    providerType: "html",
    sourceUrl: "https://www.zivilstand.sid.be.ch/de/start/heirat/externe-trauungslokale/schloss-oberhofen.html",
    connectorKey: "official-published-dates-html",
    sourceQuality: "official_webpage",
    active: true,
    syncFrequencyMinutes: 1440,
    metadata: { mvp: true, jurisdiction: "BE", office: "Zivilstandsamt Oberland West" },
  },
  {
    targetType: "office",
    targetCanonicalId: null,
    targetSlug: "zuerich",
    providerType: "structured_booking_system",
    sourceUrl: "https://www.stadt-zuerich.ch/de/lebenslagen/einwohner-services/heiraten/hochzeitstermin-schweizer-pass/hochzeitstermin-schweizer-wohnort-zuerich.html",
    connectorKey: "manual",
    sourceQuality: "official_booking_system",
    active: false,
    syncFrequencyMinutes: 1440,
    metadata: { mvp: true, discoveryStatus: "pending_verified_public_endpoint", jurisdiction: "ZH" },
  },
  {
    targetType: "office",
    targetCanonicalId: null,
    targetSlug: "basel-stadt",
    providerType: "structured_booking_system",
    sourceUrl: "https://www.bs.ch/themen/persoenliches-und-wohnen/heiraten/wir-moechten-heiraten-was-ist-zu-tun/ehevorbereitungsverfahren-einleiten/trauung-im-zivilstandsamt-basel",
    connectorKey: "manual",
    sourceQuality: "official_booking_system",
    active: false,
    syncFrequencyMinutes: 1440,
    metadata: { mvp: true, discoveryStatus: "pending_verified_public_endpoint", jurisdiction: "BS" },
  },
  {
    targetType: "office",
    targetCanonicalId: null,
    targetSlug: "winterthur",
    providerType: "structured_booking_system",
    sourceUrl: "https://stadt.winterthur.ch/gemeinde/verwaltung/sicherheit-und-umwelt/melde-und-zivilstandswesen/zivilstandsamt/heirat/lokale-daten-und-zeiten/online-reservation-traulokale",
    connectorKey: "manual",
    sourceQuality: "official_booking_system",
    active: false,
    syncFrequencyMinutes: 1440,
    metadata: { mvp: true, discoveryStatus: "pending_verified_public_endpoint", jurisdiction: "ZH", systemHint: "Planyo" },
  },
] as const;

export async function ensureAvailabilityMvpSources() {
  for (const source of availabilityMvpSources) {
    await prisma.availabilitySource.upsert({
      where: {
        targetType_targetSlug_sourceUrl: {
          targetType: source.targetType,
          targetSlug: source.targetSlug,
          sourceUrl: source.sourceUrl,
        },
      },
      update: {
        targetCanonicalId: source.targetCanonicalId,
        providerType: source.providerType,
        connectorKey: source.connectorKey,
        sourceQuality: source.sourceQuality,
        active: source.active,
        syncFrequencyMinutes: source.syncFrequencyMinutes,
        metadata: source.metadata,
      },
      create: source,
    });
  }
}
