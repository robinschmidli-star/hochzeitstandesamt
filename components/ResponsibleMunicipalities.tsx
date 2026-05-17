"use client";

import { useState } from "react";

type ResponsibleMunicipalitiesProps = {
  municipalities: string[];
};

const visibleLimit = 24;

export function ResponsibleMunicipalities({ municipalities }: ResponsibleMunicipalitiesProps) {
  const [expanded, setExpanded] = useState(false);
  const hasManyMunicipalities = municipalities.length > visibleLimit;

  if (!municipalities.length) return null;

  return (
    <section className="grid gap-5 rounded-xl border border-linen bg-white p-6 shadow-soft">
      <div className="grid gap-3">
        <h2 className="text-2xl font-semibold text-ink">Für diese Wohnorte zuständig</h2>
        <p className="max-w-4xl text-sm leading-6 text-soft-ink">
          Wohnen Sie in einer dieser Gemeinden? Dann ist dieses Zivilstandsamt in der Regel Ihre offizielle Anlaufstelle für
          Ehevorbereitung, Dokumentenprüfung und zivile Trauung.
        </p>
        <p className="max-w-4xl text-xs leading-5 text-soft-ink">
          Hinweis: Die Ehevorbereitung erfolgt normalerweise beim zuständigen Zivilstandsamt. Die Trauung kann je nach Kanton
          und Verfügbarkeit auch an einem anderen zugelassenen Trauort stattfinden.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {municipalities.map((municipality, index) => (
          <a
            key={municipality}
            href={`/standesamt-finden?query=${encodeURIComponent(municipality)}&submitted=1`}
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
          {expanded ? "Weniger anzeigen" : "Alle Gemeinden anzeigen"}
        </button>
      ) : null}
    </section>
  );
}
