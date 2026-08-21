import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";

export function GET() {
  const content = `# hochzeitstandesamt.ch

> Strukturierte Such- und Informationsplattform für Schweizer Zivilstandsämter und offizielle Traulokale. Angaben dienen der Orientierung; verbindlich sind die verlinkten Behörden.

## Zentrale Bereiche
- [Standesamt finden](${siteUrl}/standesamt-finden): Suche nach Kanton, Gemeinde, Ort und Eigenschaften.
- [Alle Kantone](${siteUrl}/): ${registryCantons.length} Kantone mit ${swissRegistryOffices.length} öffentlichen Zivilstandsämtern.
- [Ratgeber](${siteUrl}/ratgeber): Redaktionelle Informationen zur zivilen Trauung.
- [Vollständiges öffentliches Verzeichnis](${siteUrl}/llms-full.txt): Ämter, Traulokale und kanonische URLs.
- [Sitemap](${siteUrl}/sitemap.xml): Indexierbare Seiten.

## Nutzungshinweise
- Offizielle Namen bleiben in ihrer Originalsprache.
- Unbekannte Angaben sind nicht als Nein zu interpretieren.
- Preise, Termine, Zuständigkeit und Verfügbarkeit immer bei der offiziellen Behörde bestätigen.
- Quellen- und Behördenlinks auf den Detailseiten haben Vorrang.
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
