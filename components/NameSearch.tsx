"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NameSearchSuggestion } from "@/lib/name-search";
import type { Dictionary } from "@/lib/i18n";
import de from "@/locales/de.json";

export function NameSearch({ dictionary, defaultValue = "", compact = false, pathPrefix = "", hiddenParams = {}, children, quickFilters }: {
  dictionary: Dictionary;
  defaultValue?: string;
  compact?: boolean;
  pathPrefix?: string;
  hiddenParams?: Record<string, string | undefined>;
  children?: ReactNode;
  quickFilters?: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [matches, setMatches] = useState<NameSearchSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const router = useRouter();
  const t = (key: string) => dictionary[key] ?? (de as Dictionary)[key] ?? key;

  useEffect(() => {
    const query = value.trim();
    setActiveIndex(-1);
    if (query.length < 2) {
      setMatches([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/name-search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json() as { suggestions?: NameSearchSuggestion[] };
        setMatches(data.suggestions ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setMatches([]);
      }
    }, 180);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  const showPanel = focused && value.trim().length >= 2;

  function selectSuggestion(suggestion: NameSearchSuggestion) {
    if (!children || !formRef.current) {
      router.push(`${pathPrefix}${suggestion.href}`);
      return;
    }
    const params = new URLSearchParams();
    new FormData(formRef.current).forEach((value, key) => {
      if (typeof value === "string") params.append(key, value);
    });
    params.set("name", suggestion.name);
    router.push(`${pathPrefix || "/"}?${params}#results`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showPanel || !matches.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? matches.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(matches[activeIndex]);
    } else if (event.key === "Escape") {
      setFocused(false);
    }
  }

  return (
    <form ref={formRef} action={`${pathPrefix || "/"}#results`} className="relative grid min-w-0 gap-3" role="search">
      {Object.entries(hiddenParams).map(([name, hiddenValue]) => hiddenValue && name !== "name" ? <input key={name} type="hidden" name={name} value={hiddenValue} /> : null)}
      <label htmlFor={compact ? "name-search-filter" : "name-search-home"} className="text-sm font-medium text-ink">
        {t("nameSearch.label")}
      </label>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <input
          id={compact ? "name-search-filter" : "name-search-home"}
          name="name"
          type="search"
          autoComplete="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder={t("nameSearch.placeholder")}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          className="focus-ring h-12 min-h-12 min-w-0 flex-1 rounded-lg border border-linen bg-white px-3 text-base text-soft-ink"
        />
        {!children ? <button className="focus-ring min-h-12 rounded-lg bg-sage px-5 py-3 font-semibold text-white">
          {t("nameSearch.submit")}
        </button> : null}
      </div>
      <p className="hidden text-xs text-soft-ink sm:block">{t("nameSearch.help")}</p>
      {children}
      {children ? <div className="flex flex-col gap-2 sm:flex-row">
        <button className="focus-ring min-h-12 rounded-lg bg-sage px-5 py-3 font-semibold text-white">{t("homeSearch.submit")}</button>
        <Link href={pathPrefix || "/"} className="focus-ring inline-flex min-h-12 items-center justify-center rounded-lg border border-linen px-5 py-3 font-semibold text-sage">{t("discovery.reset")}</Link>
      </div> : null}
      {quickFilters}
      {showPanel ? (
        <div id={listboxId} className="absolute left-0 right-0 top-[5.25rem] z-50 max-h-[min(24rem,55vh)] overflow-y-auto rounded-xl border border-linen bg-white p-1 shadow-xl sm:right-32" role="listbox">
          {matches.length ? matches.map((suggestion, index) => (
            <Link key={suggestion.id} id={`${listboxId}-${index}`} href={`${pathPrefix}${suggestion.href}`} onClick={children ? (event) => { event.preventDefault(); selectSuggestion(suggestion); } : undefined} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} role="option" aria-selected={activeIndex === index} className={`focus-ring flex min-h-14 items-center justify-between gap-3 rounded-lg px-3 py-2 ${activeIndex === index ? "bg-paper" : "hover:bg-paper"}`}>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink">{suggestion.name}</span>
                <span className="block text-xs text-soft-ink">
                  {suggestion.type === "office" ? t("nameSearch.office") : t("nameSearch.venue")} · {suggestion.place || suggestion.canton}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-sage">{suggestion.canton}</span>
            </Link>
          )) : (
            <div className="px-3 py-4 text-sm text-soft-ink">
              <p className="font-semibold text-ink">{t("nameSearch.noResults")}</p>
              <p className="mt-1">{t("nameSearch.noResultsHelp")}</p>
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}
