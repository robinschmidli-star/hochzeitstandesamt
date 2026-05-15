import { registryCantons } from "@/lib/registry-data";
import { swissCantonPaths } from "@/lib/swiss-map-paths";

export function SwissMap({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className={embedded ? "" : "rounded-xl border border-linen bg-white p-5 shadow-soft"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {!embedded ? (
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Interaktive Schweizkarte</p>
          ) : null}
          <h2 className={embedded ? "text-2xl font-semibold text-ink" : "mt-2 text-2xl font-semibold text-ink"}>Nach Kanton auswählen</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-soft-ink">
          Jeder Kanton führt direkt zu den Zivilstandsämtern und Gemeinden im gewählten Kanton.
        </p>
      </div>
      <div className={`${embedded ? "mt-3 h-[300px] sm:h-[360px] lg:h-[400px]" : "mt-6"} flex flex-col overflow-hidden rounded-xl bg-linen/70 p-3 sm:p-5`}>
        <svg viewBox="-30 110 1060 500" role="img" aria-label="Klickbare Karte der Schweizer Kantone" className="min-h-0 flex-1">
          <defs>
            <filter id="mapShadowSearch" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#24211f" floodOpacity="0.12" />
            </filter>
          </defs>
          <g filter="url(#mapShadowSearch)">
            {swissCantonPaths.map((shape) => {
              const canton = registryCantons.find((item) => item.code === shape.code);
              if (!canton) return null;
              return (
                <a key={shape.code} href={`/standesamt-finden?canton=${shape.code}`} aria-label={`${canton.name}: ${canton.officeCount} Ämter`}>
                  <path d={shape.d} className="fill-white stroke-white stroke-[2] transition hover:fill-champagne focus:fill-champagne">
                    <title>{`${canton.name}: ${canton.officeCount} Ämter`}</title>
                  </path>
                </a>
              );
            })}
          </g>
          {swissCantonPaths.map((shape) => (
            <a key={`${shape.code}-label`} href={`/standesamt-finden?canton=${shape.code}`} aria-hidden="true">
              <text
                x={shape.label[0]}
                y={shape.label[1]}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none fill-ink text-[22px] font-bold"
              >
                {shape.code}
              </text>
            </a>
          ))}
        </svg>
        <p className="mt-2 shrink-0 text-xs leading-5 text-soft-ink">
          Kartendaten: swiss-maps, basierend auf generalisierten Schweizer Verwaltungsgrenzen von swisstopo/BFS.
        </p>
      </div>
    </section>
  );
}
