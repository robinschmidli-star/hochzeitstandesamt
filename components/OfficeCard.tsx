import Link from "next/link";
import { registryOfficeMedia } from "@/lib/safe-media";
import { repairText } from "@/lib/search-experience";
import type { SwissRegistryOffice } from "@/lib/types";

export function OfficeCard({ office }: { office: SwissRegistryOffice }) {
  const city = repairText(office.city);
  const municipalities = office.responsibleMunicipalities.map(repairText);
  const media = registryOfficeMedia(office);

  return (
    <article className="rounded-xl border border-linen bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{repairText(office.cantonName)} · {office.canton}</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{repairText(office.name)}</h2>
        </div>
        {media.url ? (
          <img src={media.url} alt={media.alt} className="h-12 w-12 object-contain" loading="lazy" />
        ) : (
          <span className="rounded-full bg-linen px-3 py-1 text-xs font-semibold text-sage">{city}</span>
        )}
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-soft-ink">
        <div>
          <dt className="font-semibold text-ink">Adresse</dt>
          <dd>{repairText(office.addressLine1)}, {office.postalCode} {city}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Kontakt</dt>
          <dd>{[office.phone, office.email].filter(Boolean).join(" · ") || "Telefon nicht in der Liste"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Zuständige Gemeinden</dt>
          <dd>{municipalities.slice(0, 5).join(", ")}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/zivilstandsamt/${office.slug}`} className="focus-ring rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage/90">
          Details ansehen
        </Link>
        {office.email ? (
          <a
            href={`mailto:${office.email}`}
            className="focus-ring rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-ink transition hover:border-sage/30 hover:text-sage"
          >
            E-Mail an Amt
          </a>
        ) : null}
      </div>
    </article>
  );
}
