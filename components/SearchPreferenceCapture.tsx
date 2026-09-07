"use client";

import { useEffect } from "react";
import { browserId } from "@/lib/browser-identity";
import type { SearchParams } from "@/lib/search-experience";
import { track } from "@/components/Analytics";

export function SearchPreferenceCapture({ params, resultCount, language }: { params: SearchParams; resultCount: number; language: string }) {
  useEffect(() => {
    const payload = {
      version: 1, canton: params.canton, guests: params.maxGuests ? Number(params.maxGuests) : undefined,
      date: params.date, dateFrom: params.dateStart, dateTo: params.dateEnd,
      saturdayOnly: params.saturdayOnly === "true" || params.weekday === "saturday",
      tag: params.tag, elopement: params.elopement === "true", outdoor: params.outdoor === "true",
      radiusKm: params.radius ? Number(params.radius) : undefined, resultCount,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem("hs_last_search", JSON.stringify(payload));
      const fingerprint = JSON.stringify(payload, (key, value) => key === "updatedAt" ? undefined : value);
      if (sessionStorage.getItem("hs_search_fingerprint") === fingerprint) return;
      sessionStorage.setItem("hs_search_fingerprint", fingerprint);
      const eventProperties = {
        ...(params.name ? { search_query: params.name } : {}), language,
        ...(params.canton ? { canton: params.canton } : {}), ...(params.date ? { date: params.date } : {}),
        ...(params.maxGuests ? { guests: Number(params.maxGuests) } : {}), saturdayOnly: payload.saturdayOnly,
        ...(params.tag ? { tag: params.tag } : {}), elopement: payload.elopement, resultCount
      };
      track("search_started", eventProperties);
      track("search_results_viewed", eventProperties);
      track("search_completed", eventProperties);
      void fetch("/api/preferences/search", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, version: undefined, updatedAt: undefined, visitorId: browserId("hs_visitor", localStorage), sessionId: browserId("hs_session", sessionStorage) })
      }).then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { searchContextId?: string };
        if (result.searchContextId) sessionStorage.setItem("hs_search_context_id", result.searchContextId);
      }).catch(() => undefined);
    } catch { /* persistence and server recording are non-blocking */ }
  }, [params, resultCount, language]);
  return null;
}
