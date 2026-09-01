import { officeMapPoints } from "@/lib/office-map-points";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { repairText } from "@/lib/search-experience";
import { swissCantonPaths } from "@/lib/swiss-map-paths";
import { defaultRegistrySearchLabels, type RegistrySearchLabels } from "@/lib/registry-search-labels";
import { withLocalePath } from "@/lib/i18n";

export function SwissMap({ embedded = false, selectedCanton = "", labels = defaultRegistrySearchLabels, searchPath = "/standesamt-finden", searchQuery = "" }: { embedded?: boolean; selectedCanton?: string; labels?: RegistrySearchLabels; searchPath?: string; searchQuery?: string }) {
  const cantonHref = (canton?: string) => {
    const query = new URLSearchParams(searchQuery);
    query.delete("page");
    if (canton) query.set("canton", canton);
    else query.delete("canton");
    if (searchPath === "/") query.set("submitted", "1");
    return `${withLocalePath(searchPath, labels.locale)}${query.size ? `?${query}` : ""}${searchPath === "/" ? "#results" : ""}`;
  };
  const selectedShape = swissCantonPaths.find((shape) => shape.code === selectedCanton);
  const selectedCantonInfo = registryCantons.find((canton) => canton.code === selectedCanton);
  const selectedOfficePoints = selectedCanton
    ? officeMapPoints
        .filter((point) => point.canton === selectedCanton)
        .map((point) => ({
          ...point,
          office: swissRegistryOffices.find((office) => office.slug === point.slug)
        }))
        .filter((point) => point.office)
    : [];
  const viewBox = selectedShape
    ? `${Math.max(selectedShape.bounds[0] - 18, 0)} ${Math.max(selectedShape.bounds[1] - 18, 0)} ${selectedShape.bounds[2] - selectedShape.bounds[0] + 36} ${selectedShape.bounds[3] - selectedShape.bounds[1] + 36}`
    : "-30 110 1060 500";

  return (
    <section className={embedded ? "" : "rounded-xl border border-linen bg-white p-5 shadow-soft"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {!embedded ? (
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{labels.mapEyebrow}</p>
          ) : null}
          <h2 className={embedded ? "text-2xl font-semibold text-ink" : "mt-2 text-2xl font-semibold text-ink"}>
            {selectedCantonInfo ? `${labels.mapSelected} ${repairText(selectedCantonInfo.name)}` : labels.mapSelect}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-soft-ink">
          {selectedCantonInfo
            ? labels.mapSelectedIntro
            : labels.mapIntro}
        </p>
      </div>
      <div className={`${embedded ? "mt-3 h-[300px] sm:h-[360px] lg:h-[400px]" : "mt-6"} flex flex-col overflow-hidden rounded-xl bg-linen/70 p-3 sm:p-5`}>
        {selectedCantonInfo ? (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <a href={cantonHref()} className="focus-ring rounded-lg border border-sage/15 bg-white px-3 py-1.5 text-sm font-semibold text-sage transition hover:border-sage/30">
              {labels.back}
            </a>
            <span className="text-sm text-soft-ink">{selectedOfficePoints.length} {labels.offices}</span>
          </div>
        ) : null}
        <svg viewBox={viewBox} role="img" aria-label={labels.mapAria} className="min-h-0 flex-1 transition-all duration-500">
          <defs>
            <filter id="mapShadowSearch" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#24211f" floodOpacity="0.12" />
            </filter>
          </defs>
          <g filter={selectedShape ? undefined : "url(#mapShadowSearch)"}>
            {swissCantonPaths.map((shape) => {
              const canton = registryCantons.find((item) => item.code === shape.code);
              if (!canton) return null;
              const label = `${repairText(canton.name)}: ${canton.officeCount} ${labels.offices}`;
              const isSelected = selectedCanton === shape.code;
              return (
                <a key={shape.code} href={cantonHref(shape.code)} aria-label={label}>
                  <path
                    d={shape.d}
                    className={`transition hover:fill-champagne focus:fill-champagne ${
                      selectedCanton
                        ? isSelected
                          ? "fill-white stroke-sage/35 stroke-[1.8]"
                          : "fill-transparent stroke-transparent opacity-0"
                        : "fill-white stroke-white stroke-[2]"
                    }`}
                  >
                    <title>{label}</title>
                  </path>
                </a>
              );
            })}
          </g>
          {!selectedCanton
            ? swissCantonPaths.map((shape) => (
                <a key={`${shape.code}-label`} href={cantonHref(shape.code)} aria-hidden="true" tabIndex={-1}>
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
              ))
            : null}
          {selectedOfficePoints.map((point) => {
            const office = point.office;
            if (!office) return null;
            const label = repairText(office.name);
            return (
              <a key={point.slug} href={withLocalePath(`/zivilstandsamt/${point.slug}`, labels.locale)} aria-label={label}>
                <circle cx={point.x} cy={point.y} r="2.4" className="fill-sage stroke-white stroke-[0.9] transition hover:fill-champagne focus:fill-champagne" />
                <title>{label}</title>
              </a>
            );
          })}
        </svg>
        <p className="mt-2 shrink-0 text-xs leading-5 text-soft-ink">
          {labels.mapSource}
        </p>
      </div>
    </section>
  );
}
