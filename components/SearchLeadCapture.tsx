"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { SearchParams } from "@/lib/search-experience";
import { track } from "@/components/Analytics";
import type { Dictionary } from "@/lib/i18n";

function firstValue(value?: string) {
  return value?.trim() || "";
}

function getSearchType(params: SearchParams) {
  if (params.saturdayOnly === "true" || params.weekday === "saturday") return "saturday_search";
  if (params.tag) return "beautiful_locations";
  if (params.location || params.canton) return "location_search";
  if (params.date || params.month || params.year || params.weekday) return "date_search";
  return "location_search";
}

function getLocale(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && firstSegment.length <= 2 ? firstSegment : "de";
}

export function SearchLeadCapture({ params, dictionary, language }: { params: SearchParams; dictionary: Dictionary; language: string }) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const locale = language || getLocale(pathname);
  const t = (key: string) => dictionary[key] ?? key;

  const payload = useMemo(() => {
    const location = firstValue(params.location);
    return {
      leadType: "search_save",
      sourcePage: typeof window === "undefined" ? pathname : window.location.pathname + window.location.search,
      language: locale,
      searchType: getSearchType(params),
      weddingDate: firstValue(params.date),
      desiredDate: firstValue(params.date),
      dateRangeStart: "",
      dateRangeEnd: "",
      weekday: firstValue(params.weekday || (params.saturdayOnly === "true" ? "saturday" : "")),
      elopement: params.elopement === "true",
      location,
      canton: firstValue(params.canton),
      city: location,
      selectedVenueIds: [],
      favoriteVenueIds: []
    };
  }, [locale, params, pathname]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const analytics = { searchType: payload.searchType, canton: payload.canton, language: locale, elopement: payload.elopement };
    track("lead_started", analytics);
    track("shortlist_save_started", analytics);
    setMessage("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        email,
        firstName,
        marketingConsent
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus("error");
      setMessage(data?.message || t("lead.error"));
      return;
    }

    setStatus("success");
    track("lead_submitted", analytics);
    track("lead_created", analytics);
    setMessage(
      marketingConsent
        ? t("lead.successMarketing")
        : t("lead.success")
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-sage/10 bg-white p-5 shadow-soft sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{t("lead.eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{t("lead.title")}</h2>
          <p className="mt-3 text-sm leading-6 text-soft-ink">{t("lead.description")}</p>
        </div>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink">
              {t("lead.firstName")}
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              {t("lead.email")}
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
            </label>
          </div>
          <label className="flex gap-3 text-sm leading-6 text-soft-ink">
            <input checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 rounded border-linen accent-sage" />
            {t("lead.consent")}
          </label>
          <p className="text-xs leading-5 text-soft-ink/80">
            {t("lead.privacyPrefix")} <Link href="/datenschutz" className="font-semibold text-sage">{t("lead.privacyLink")}</Link>.
          </p>
          <button disabled={status === "saving"} className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90 disabled:cursor-wait disabled:opacity-70">
            {status === "saving" ? t("lead.saving") : t("lead.submit")}
          </button>
          {message ? (
            <p className={`rounded-lg px-3 py-2 text-sm font-medium ${status === "success" ? "bg-sage/10 text-sage" : "bg-red-50 text-red-700"}`}>
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
