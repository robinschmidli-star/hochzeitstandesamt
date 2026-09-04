import { ceremonyVenues } from "@/lib/ceremony-venues";
import { swissRegistryOffices } from "@/lib/registry-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";

export function GET() {
  const venuesByOffice = new Map<string, string[]>();
  for (const venue of ceremonyVenues) {
    const venues = venuesByOffice.get(venue.standesamt_id) ?? [];
    venues.push(venue.traulokal_name);
    venuesByOffice.set(venue.standesamt_id, venues);
  }

  const offices = swissRegistryOffices.map((office) => {
    const venues = (office.canonicalId ? venuesByOffice.get(office.canonicalId) : undefined) ?? venuesByOffice.get(office.id) ?? venuesByOffice.get(office.slug) ?? [];
    const municipalitySummary = Array.isArray(office.responsibleMunicipalities)
      ? office.responsibleMunicipalities.slice(0, 20).join(", ")
      : office.responsibleMunicipalities;
    return [
      `## ${office.name}`,
      `- URL: ${siteUrl}/zivilstandsamt/${office.slug}`,
      `- Region: ${office.cantonName} (${office.canton})`,
      `- Ort: ${office.postalCode} ${office.city}`,
      municipalitySummary ? `- Zuständige Gemeinden: ${municipalitySummary}` : "",
      venues.length ? `- Zugeordnete Traulokale: ${venues.join(", ")}` : ""
    ].filter(Boolean).join("\n");
  });

  const content = `# Öffentliches Verzeichnis von hochzeitstandesamt.ch

> Automatisch aus denselben öffentlichen Daten wie Website und Suche erzeugt. Keine separate Datenquelle. Verfügbarkeit und Bedingungen müssen offiziell bestätigt werden.

${offices.join("\n\n")}
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
