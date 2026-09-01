"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { withLocalePath } from "@/lib/i18n";

type ResponsibleMunicipalitiesProps = {
  municipalities: string[];
  dictionary: Dictionary;
  locale: Locale;
};

const visibleLimit = 24;

export function ResponsibleMunicipalities({ municipalities, dictionary, locale }: ResponsibleMunicipalitiesProps) {
  const [expanded, setExpanded] = useState(false);
  const hasManyMunicipalities = municipalities.length > visibleLimit;
  const t = (key: string) => dictionary[key] ?? key;

  if (!municipalities.length) return null;

  return (
    <section className="grid gap-5 rounded-xl border border-linen bg-white p-6 shadow-soft">
      <div className="grid gap-3">
        <h2 className="text-2xl font-semibold text-ink">{t("office.municipalities.title")}</h2>
        <p className="max-w-4xl text-sm leading-6 text-soft-ink">
          {t("office.municipalities.description")}
        </p>
        <p className="max-w-4xl text-xs leading-5 text-soft-ink">
          {t("office.municipalities.note")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {municipalities.map((municipality, index) => (
          <a
            key={municipality}
            href={`${withLocalePath("/", locale)}?name=${encodeURIComponent(municipality)}&submitted=1#results`}
            className={`focus-ring rounded-full bg-linen px-3 py-1 text-sm text-soft-ink transition hover:bg-sage/10 hover:text-sage ${
              !expanded && index >= visibleLimit ? "hidden" : ""
            }`}
          >
            {municipality}
          </a>
        ))}
      </div>

      {hasManyMunicipalities ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="focus-ring justify-self-start rounded-lg border border-linen bg-white px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30"
        >
          {expanded ? t("common.showLess") : t("office.municipalities.showAll")}
        </button>
      ) : null}
    </section>
  );
}
