import type { SearchParams } from "@/lib/search-experience";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const searchKeys = ["name", "location", "radius", "canton", "month", "year", "date", "weekday", "tag", "saturdayOnly", "elopement", "wheelchair", "parking", "evening", "outdoor", "onlineBooking", "multipleVenues", "maxGuests", "postalCode", "dateStart", "dateEnd", "preferredWeekdays", "submitted", "page"] as const satisfies readonly (keyof SearchParams)[];

export function parseSearchParams(raw: RawSearchParams): SearchParams {
  const params: SearchParams = {};
  for (const key of searchKeys) {
    const value = raw[key];
    const text = (Array.isArray(value) ? key === "preferredWeekdays" ? value.join(",") : value[0] : value)?.trim();
    if (text) params[key] = text;
  }
  const query = Array.isArray(raw.query) ? raw.query[0] : raw.query;
  if (!params.name && query?.trim()) params.name = query.trim();
  return params;
}

export function hasActiveSearch(params: SearchParams) {
  return Object.entries(params).some(([key, value]) => Boolean(value) && !["radius", "page"].includes(key));
}

// URL parameters are the sole persisted search state. Changing filters resets paging.
export function discoveryHref(params: SearchParams = {}, changes: SearchParams = {}, pathPrefix = "") {
  const merged = { ...params, page: undefined, ...changes };
  const query = new URLSearchParams();
  for (const key of searchKeys) {
    if (merged[key]) query.set(key, merged[key]!);
  }
  return `${pathPrefix || "/"}${query.size ? `?${query}` : ""}#results`;
}

export function paginateResults<T>(items: T[], requestedPage?: string, pageSize = 12) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const parsed = Number(requestedPage);
  const page = Math.min(pageCount, Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageCount, total: items.length };
}
