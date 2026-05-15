export type Canton = {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
  description: string;
};

export type City = {
  id: string;
  name: string;
  slug: string;
  cantonSlug: string;
  postalCode: string;
  description: string;
};

export type CivilRegistryOffice = {
  id: string;
  name: string;
  slug: string;
  cantonSlug: string;
  citySlug: string;
  addressLine1: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  websiteUrl: string;
  appointmentUrl?: string;
  openingHours?: string;
  languages: string[];
  responsibleMunicipalities: string[];
  description: string;
  documentsInfo: string;
  ceremonyInfo: string;
  sourceUrl: string;
  lastVerifiedAt: string;
};

export type GuideArticle = {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string[];
  faq: { question: string; answer: string }[];
  sourceName?: string;
  sourceUrl?: string;
  sourceDescription?: string;
  officialLinks?: { title: string; description: string; url: string; meta?: string }[];
};

export type Vendor = {
  companyName: string;
  slug: string;
  category: string;
  region: string;
  cantonSlug: string;
  shortDescription: string;
  websiteUrl: string;
  priceRange: string;
  languages: string[];
  styleTags: string[];
  featured: boolean;
};

export type RegistryCanton = {
  code: string;
  name: string;
  slug: string;
  officeCount: number;
  municipalityCount: number;
  map: number[];
};

export type SwissRegistryOffice = {
  id: string;
  name: string;
  slug: string;
  canton: string;
  cantonName: string;
  postalCode: string;
  city: string;
  addressLine1: string;
  postBox: string;
  phone: string;
  fax: string;
  email: string;
  officialUrl: string;
  openingHours?: string;
  ceremonyLocations?: string[];
  ceremonyTimes?: string;
  wheelchairAccessible?: string;
  parking?: string;
  onlineCalendarAvailable?: string;
  onlineCalendarUrl?: string;
  coatOfArmsUrl?: string;
  imageUrl?: string;
  mediaAlt?: string;
  mediaLicenseNote?: string;
  responsibleMunicipalities: string[];
  map: number[];
};
