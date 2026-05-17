import { enrichOffice } from "@/lib/search-experience";
import { swissRegistryOffices } from "@/lib/registry-data";

export const vendorCategories = [
  "Floristik",
  "Fotografen",
  "Videografen",
  "Wedding Planner",
  "Brautmode",
  "Trauringe / Schmuck",
  "Musik & DJs",
  "Catering",
  "Hochzeitstorten",
  "Dekoration",
  "Make-up & Hair",
  "Hochzeitsautos / Transport",
  "Locations",
  "Recht & Ehevertrag"
];

export const unicoProvider = {
  name: "UNICO Florales & Design GmbH",
  slug: "unico-florales-design",
  category: "Hochzeitsfloristik",
  categoryPath: "/anbieter/floristik",
  location: "Wängi TG",
  address: "Frauenfelderstrasse 14, 9545 Wängi",
  phone: "+41 79 477 10 00",
  email: "info@unicofloristik.ch",
  websiteUrl: "https://www.unicofloristik.ch/",
  images: [
    {
      src: "/vendors/unico/hochzeitsfloristik-tisch.png",
      alt: "Hochzeitsfloristik von UNICO mit floraler Tischdekoration"
    },
    {
      src: "/vendors/unico/hochzeitsfloristik-brautpaar.png",
      alt: "Hochzeitspaar mit floraler Dekoration von UNICO"
    },
    {
      src: "/vendors/unico/hochzeitsfloristik-feier.png",
      alt: "Hochzeitsfeier mit eleganter Floristik von UNICO"
    }
  ],
  coordinates: { lat: 47.4965, lon: 8.9533 },
  description:
    "UNICO Florales & Design gestaltet individuelle Hochzeitsfloristik und elegante Dekorationskonzepte für zivile Trauungen, Hochzeitsfeiern und besondere Events. Im Showroom in Wängi TG können Paare ihre Wünsche persönlich besprechen und florale Konzepte für ihren grossen Tag entwickeln.",
  services: [
    "Brautstrauss",
    "Tischdekoration",
    "Zeremonie-Dekoration",
    "Blumenschmuck",
    "Hochzeitskonzepte",
    "Eventfloristik",
    "Elegante Dekoration",
    "Persönliche Beratung"
  ],
  sourceNote:
    "Die Angaben stammen von unicofloristik.ch und öffentlichen Firmeneinträgen. UNICO beschreibt sich als Anbieter für opulente und elegante Hochzeitsdekoration seit 2016; der neue Standort wird mit Frauenfelderstrasse 14, 9545 Wängi angegeben."
};

export function nearbyRegistryOfficesForUnico() {
  return swissRegistryOffices
    .map((office) => enrichOffice(office, unicoProvider.coordinates))
    .filter((office) => typeof office.distanceKm === "number" && office.distanceKm <= 30)
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    .slice(0, 10);
}
