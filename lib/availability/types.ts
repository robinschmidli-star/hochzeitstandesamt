export type AvailabilityTargetType = "office" | "venue";
export type AvailabilityStatus = "available" | "unavailable" | "unknown";
export type AvailabilityPrecision = "exact_slot" | "date_only" | "published_wedding_day" | "unknown";
export type AvailabilitySourceQuality = "official_api" | "official_booking_system" | "official_webpage" | "manual_official_confirmation";

export type NormalizedAvailabilitySlot = {
  externalKey: string;
  date: Date;
  startAt?: Date | null;
  endAt?: Date | null;
  status: AvailabilityStatus;
  precision: AvailabilityPrecision;
  sourceUpdatedAt?: Date | null;
  rawReference?: string | null;
};

export type AvailabilitySourceRecord = {
  id: string;
  targetType: AvailabilityTargetType;
  targetCanonicalId: string | null;
  targetSlug: string;
  providerType: string;
  sourceUrl: string;
  connectorKey: string;
  sourceQuality: AvailabilitySourceQuality;
  metadata: unknown;
};

export interface AvailabilityConnector {
  key: string;
  fetch(source: AvailabilitySourceRecord, signal: AbortSignal): Promise<string>;
  normalize(payload: string, source: AvailabilitySourceRecord): Promise<NormalizedAvailabilitySlot[]>;
}
