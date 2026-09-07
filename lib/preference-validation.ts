import { z } from "zod";
import { visitorIdSchema } from "@/lib/visitor-identity";

const emptyToUndefined = (value: unknown) => value === "" || value === null ? undefined : value;
const dateString = z.preprocess(emptyToUndefined, z.string().date().optional());
const optionalBoolean = z.preprocess(emptyToUndefined, z.boolean().optional());
const optionalUuid = z.preprocess(emptyToUndefined, z.string().uuid().optional());

export const identitySchema = z.object({
  visitorId: visitorIdSchema,
  sessionId: optionalUuid,
  locale: z.preprocess(emptyToUndefined, z.string().min(2).max(10).optional()),
  country: z.enum(["CH", "AT", "DE"]).optional()
});

export const searchPreferenceSchema = identitySchema.extend({
  canton: z.preprocess(emptyToUndefined, z.string().trim().min(2).max(10).optional()),
  date: dateString,
  dateFrom: dateString,
  dateTo: dateString,
  guests: z.preprocess(emptyToUndefined, z.number().int().positive().max(100_000).optional()),
  saturdayOnly: optionalBoolean,
  tag: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
  elopement: optionalBoolean,
  outdoor: optionalBoolean,
  radiusKm: z.preprocess(emptyToUndefined, z.number().int().min(0).max(1_000).optional()),
  resultCount: z.preprocess(emptyToUndefined, z.number().int().min(0).max(1_000_000).optional())
}).refine((value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo, {
  path: ["dateTo"], message: "dateTo must be on or after dateFrom"
});

export const favoritePreferenceSchema = identitySchema.extend({
  venueId: z.string().uuid(),
  venueSlug: z.string().trim().min(1).max(200),
  searchContextId: optionalUuid
});

export const removeFavoritePreferenceSchema = z.object({
  visitorId: visitorIdSchema,
  venueId: z.string().uuid()
});

export const availabilityPreferenceSchema = identitySchema.extend({
  venueId: z.string().uuid(),
  venueSlug: z.string().trim().min(1).max(200),
  officeId: optionalUuid,
  requestedDate: dateString,
  requestedDateFrom: dateString,
  requestedDateTo: dateString,
  availabilityStatus: z.enum(["available", "unavailable", "unknown", "manual_check", "not_supported"])
}).refine((value) => !value.requestedDateFrom || !value.requestedDateTo || value.requestedDateFrom <= value.requestedDateTo, {
  path: ["requestedDateTo"], message: "requestedDateTo must be on or after requestedDateFrom"
});

export function toDatabaseDate(value?: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}
