"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { browserId } from "@/lib/browser-identity";

export function track(eventName: string, properties: Record<string, string | number | boolean | string[]> = {}) {
  try { void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ eventName, sessionId: browserId("hs_session", sessionStorage), visitorId: browserId("hs_visitor", localStorage), path: location.pathname + location.search, properties }) }).catch(() => undefined); } catch { /* non-blocking */ }
}
export function Analytics() {
  const pathname = usePathname(); const params = useSearchParams();
  useEffect(() => {
    track("page_view", { referrer: document.referrer.slice(0, 250), language: navigator.language });
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
