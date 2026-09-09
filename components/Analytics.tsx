"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { hasActiveSearch, parseSearchParams } from "@/lib/discovery";

function id(key: string, storage: Storage) { const current = storage.getItem(key); if (current) return current; const value = crypto.randomUUID(); storage.setItem(key, value); return value; }
export function track(eventName: string, properties: Record<string, string | number | boolean | string[]> = {}) {
  try {
    const viewport_category = innerWidth < 640 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop";
    const traffic_source = document.referrer ? new URL(document.referrer).hostname.slice(0, 100) : "direct";
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ eventName, sessionId: id("hs_session", sessionStorage), visitorId: id("hs_visitor", localStorage), path: location.pathname + location.search, properties: { viewport_category, traffic_source, ...properties } }) }).catch(() => undefined);
  } catch { /* non-blocking */ }
}
export function Analytics() {
  const pathname = usePathname(); const params = useSearchParams();
  useEffect(() => {
    track("page_view", { referrer: document.referrer.slice(0, 250), language: navigator.language });
    const searchPage = /^\/(?:fr|it|en|de)?\/?(?:search|standesamt-finden)?\/?$/.test(pathname);
    if (searchPage && hasActiveSearch(parseSearchParams(Object.fromEntries(params)))) {
      const fingerprint = params.toString();
      if (sessionStorage.getItem("hs_search_fingerprint") !== fingerprint) {
        sessionStorage.setItem("hs_search_fingerprint", fingerprint);
        const properties = { search_query: params.get("name") ?? "", filters: Array.from(params.keys()).filter((key) => params.get(key)), result_path: location.pathname };
        track("search_started", properties);
        track("search_results_viewed", properties);
        track("search_completed", properties);
      }
    }
  }, [pathname, params]);
  return null;
}
export function TrackOnMount({ eventName, properties = {} }: { eventName: string; properties?: Record<string, string | number | boolean | string[]> }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track(eventName, properties);
  }, [eventName, properties]);
  return null;
}
