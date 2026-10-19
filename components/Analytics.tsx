"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { hasActiveSearch, parseSearchParams } from "@/lib/discovery";

const BOT_UA = /bot|crawler|spider|headless|lighthouse|pagespeed|curl|wget|python|scrapy|phantom|selenium|playwright|puppeteer/i;

function id(key: string, storage: Storage) {
  const current = storage.getItem(key);
  if (current) return current;
  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}

function allowAnalyticsEvent() {
  if (navigator.webdriver || BOT_UA.test(navigator.userAgent) || location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname.endsWith(".vercel.app") || localStorage.getItem("hs_analytics_internal") === "1" || /^\/(?:de\/|en\/|fr\/|it\/)?(?:admin|verify)(?:\/|$)/.test(location.pathname)) return false;
  const now = Date.now();
  const start = Number(sessionStorage.getItem("hs_analytics_window_start") ?? "0");
  const count = Number(sessionStorage.getItem("hs_analytics_window_count") ?? "0");
  if (!start || now - start >= 60_000) {
    sessionStorage.setItem("hs_analytics_window_start", String(now));
    sessionStorage.setItem("hs_analytics_window_count", "1");
    return true;
  }
  if (count >= 30) return false;
  sessionStorage.setItem("hs_analytics_window_count", String(count + 1));
  return true;
}

export function track(eventName: string, properties: Record<string, string | number | boolean | string[]> = {}) {
  try {
    if (!allowAnalyticsEvent()) return;
    const now = Date.now();
    const last = Number(sessionStorage.getItem("hs_session_last") ?? "0");
    if (!last || now - last > 30 * 60_000) {
      sessionStorage.removeItem("hs_session");
      sessionStorage.removeItem("hs_search_fingerprint");
      const referrer = document.referrer ? new URL(document.referrer) : null;
      const campaign = new URLSearchParams(location.search).get("utm_source");
      sessionStorage.setItem("hs_entry_source", campaign?.slice(0, 100) || (referrer && referrer.host !== location.host ? referrer.hostname : "direct"));
    }
    sessionStorage.setItem("hs_session_last", String(now));
    const entry_source = sessionStorage.getItem("hs_entry_source") ?? "unknown";
    const viewport_category = innerWidth < 640 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop";
    const traffic_source = document.referrer ? new URL(document.referrer).hostname.slice(0, 100) : "direct";
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ eventName, sessionId: id("hs_session", sessionStorage), visitorId: id("hs_visitor", localStorage), path: location.pathname + location.search, properties: { viewport_category, traffic_source, entry_source, analytics_version: 2, ...properties } }) }).catch(() => undefined);
  } catch { /* non-blocking */ }
}

export function Analytics() {
  const pathname = usePathname(); const params = useSearchParams();
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor) return;
      try {
        const target = new URL(anchor.href, location.href);
        const channel = target.protocol === "mailto:" ? "email" : target.protocol === "tel:" ? "phone" : ["http:", "https:"].includes(target.protocol) && target.host !== location.host ? "website" : null;
        if (channel) track("external_link_clicked", { contact_channel: channel });
      } catch { /* invalid link must not interrupt navigation */ }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    const pageKey = location.pathname + location.search;
    const now = Date.now();
    const lastPage = sessionStorage.getItem("hs_last_page_view_path");
    const lastAt = Number(sessionStorage.getItem("hs_last_page_view_at") ?? "0");
    if (lastPage !== pageKey || now - lastAt > 10_000) {
      sessionStorage.setItem("hs_last_page_view_path", pageKey);
      sessionStorage.setItem("hs_last_page_view_at", String(now));
      track("page_view", { referrer: document.referrer.slice(0, 250), language: navigator.language });
    }
    const searchPage = /^\/(?:fr|it|en|de)?\/?(?:search|standesamt-finden)?\/?$/.test(pathname);
    if (searchPage && hasActiveSearch(parseSearchParams(Object.fromEntries(params)))) {
      const fingerprint = params.toString();
      if (sessionStorage.getItem("hs_search_fingerprint") !== fingerprint) {
        sessionStorage.setItem("hs_search_fingerprint", fingerprint);
        const properties = { search_query: params.get("name") ?? "", search_canton: params.get("canton") ?? "", filters: Array.from(params.keys()).filter((key) => params.get(key)), result_path: location.pathname };
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
