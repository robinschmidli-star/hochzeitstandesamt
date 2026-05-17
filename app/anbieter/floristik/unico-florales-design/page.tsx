import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { nearbyRegistryOfficesForUnico, unicoProvider } from "@/lib/vendor-preview";

export const metadata = createMetadata({
  title: "UNICO Florales & Design GmbH | Hochzeitsfloristik Wängi TG",
  description: "UNICO Florales & Design GmbH in Wängi TG: Hochzeitsfloristik, Blumenschmuck und elegante Dekorationskonzepte.",
  path: "/anbieter/floristik/unico-florales-design"
});

export default function UnicoVendorProfilePage() {
  const nearbyOffices = nearbyRegistryOfficesForUnico();

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 rounded-xl border border-linen bg-white p-6 shadow-soft md:grid-cols-[1.4fr_1fr] lg:p-8">
        <div className="grid gap-3 md:col-span-2 md:grid-cols-subgrid">
          {unicoProvider.images.map((image, index) => (
            <figure key={image.src} className={index === 0 ? "overflow-hidden rounded-xl bg-paper md:row-span-2" : "overflow-hidden rounded-xl bg-paper md:col-start-2"}>
              <img src={image.src} alt={image.alt} className={index === 0 ? "h-56 w-full object-cover md:h-full md:min-h-[420px]" : "h-52 w-full object-cover"} />
            </figure>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Hochzeitsfloristik</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">{unicoProvider.name}</h1>
          <p className="mt-3 text-lg text-soft-ink">{unicoProvider.location}</p>
          <p className="mt-5 max-w-3xl leading-7 text-soft-ink">{unicoProvider.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {unicoProvider.services.map((service) => (
              <span key={service} className="rounded-full bg-paper px-3 py-2 text-sm font-semibold text-soft-ink">
                {service}
              </span>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-linen bg-paper p-5">
          <h2 className="text-xl font-semibold text-ink">Kontakt</h2>
          <dl className="mt-4 grid gap-4 text-sm text-soft-ink">
            <div>
              <dt className="font-semibold text-ink">Adresse</dt>
              <dd>{unicoProvider.address}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Telefon</dt>
              <dd><a href={`tel:${unicoProvider.phone.replaceAll(" ", "")}`} className="hover:text-sage">{unicoProvider.phone}</a></dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">E-Mail</dt>
              <dd><a href={`mailto:${unicoProvider.email}`} className="hover:text-sage">{unicoProvider.email}</a></dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Website</dt>
              <dd>
                <a href={unicoProvider.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sage hover:underline">
                  unicofloristik.ch
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft lg:p-8">
        <h2 className="text-3xl font-semibold text-ink">Standesämter in der Nähe</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-soft-ink">
          Im Umkreis von 30 km Luftlinie ab Wängi TG. Die Distanz dient als Orientierung.
        </p>
        {nearbyOffices.length > 0 ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {nearbyOffices.map((office) => (
              <Link
                key={office.slug}
                href={`/zivilstandsamt/${office.slug}`}
                className="focus-ring rounded-xl border border-linen bg-paper p-4 transition hover:border-champagne"
              >
                <h3 className="font-semibold text-ink">{office.name}</h3>
                <p className="mt-1 text-sm text-soft-ink">{office.city} / {office.canton}</p>
                <p className="mt-3 text-sm font-semibold text-sage">{Math.round(office.distanceKm ?? 0)} km entfernt</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-paper p-4 text-sm text-soft-ink">
            Aktuell sind keine Standesämter im Umkreis von 30 km hinterlegt.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-linen bg-white p-5 text-sm leading-6 text-soft-ink shadow-soft">
        <h2 className="font-semibold text-ink">Quelle der Unternehmensdaten</h2>
        <p className="mt-2">{unicoProvider.sourceNote}</p>
      </section>
    </main>
  );
}
