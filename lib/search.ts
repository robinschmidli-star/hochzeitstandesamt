import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import postalCodes from "switzerland-postal-codes/dist/postal-codes-full.json";

type PostalCodeEntry = {
  name: string;
  canton: string;
  latitude: string;
  longitude: string;
};

const swissPostalCodes = postalCodes as Record<string, PostalCodeEntry[]>;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ü/g, "u")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/\([^)]*\)/g, "")
    .replace(/\b[A-Z]{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getPostalPlaces = (value: string) => {
  const postalCode = value.match(/\b\d{4}\b/)?.[0];
  if (!postalCode) return [];

  return (swissPostalCodes[postalCode] ?? []).map((entry) => ({
    name: normalize(entry.name),
    canton: normalize(entry.canton)
  }));
};

export function searchRegistryOffices(params: {
  canton?: string;
  query?: string;
  postalCode?: string;
  language?: string;
  onlineAppointment?: string;
  emailAvailable?: string;
  phoneAvailable?: string;
}) {
  const cantonQuery = params.canton ? normalize(params.canton) : "";
  const textQuery = params.query ? normalize(params.query) : "";
  const postalQuery = params.postalCode ? normalize(params.postalCode) : "";
  const postalPlaces = [...getPostalPlaces(params.query ?? ""), ...getPostalPlaces(params.postalCode ?? "")];

  return swissRegistryOffices.filter((office) => {
    const canton = registryCantons.find((item) => item.code === office.canton);
    const haystack = normalize(
      [
        office.name,
        office.city,
        office.postalCode,
        office.addressLine1,
        office.postBox,
        office.email,
        office.phone,
        office.canton,
        office.cantonName,
        ...office.responsibleMunicipalities
      ].join(" ")
    );

    const matchesCanton =
      !cantonQuery ||
      normalize(office.canton) === cantonQuery ||
      normalize(office.cantonName) === cantonQuery ||
      canton?.slug === cantonQuery;
    const matchesPostalPlace =
      postalPlaces.length > 0 &&
      postalPlaces.some((place) => {
        const sameCanton = !place.canton || normalize(office.canton) === place.canton;
        return (
          sameCanton &&
          (normalize(office.city) === place.name ||
            normalize(office.city).includes(place.name) ||
            office.responsibleMunicipalities.some((municipality) => normalize(municipality) === place.name))
        );
      });
    const matchesText = !textQuery || haystack.includes(textQuery) || matchesPostalPlace;
    const matchesPostal = !postalQuery || normalize(office.postalCode).includes(postalQuery) || matchesPostalPlace;
    const matchesEmail = params.emailAvailable !== "on" || Boolean(office.email);
    const matchesPhone = params.phoneAvailable !== "on" || Boolean(office.phone);

    return matchesCanton && matchesText && matchesPostal && matchesEmail && matchesPhone;
  });
}
