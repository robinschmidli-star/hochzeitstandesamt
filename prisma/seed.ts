import { PrismaClient } from "@prisma/client";
import { cantons, cities, registryOffices, guides, vendors } from "../lib/data";

const prisma = new PrismaClient();

async function main() {
  for (const canton of cantons) {
    await prisma.canton.upsert({
      where: { slug: canton.slug },
      update: {
        nameDe: canton.name,
        abbreviation: canton.abbreviation,
        description: canton.description
      },
      create: {
        id: canton.id,
        nameDe: canton.name,
        slug: canton.slug,
        abbreviation: canton.abbreviation,
        description: canton.description,
        metaTitle: `Standesamt ${canton.name} - Heiraten im Kanton ${canton.name}`,
        metaDescription: `Finde Zivilstandsaemter, Ablauf und Informationen zur standesamtlichen Trauung im Kanton ${canton.name}.`
      }
    });
  }

  for (const city of cities) {
    const canton = await prisma.canton.findUniqueOrThrow({ where: { slug: city.cantonSlug } });
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: {
        name: city.name,
        postalCode: city.postalCode,
        description: city.description,
        cantonId: canton.id
      },
      create: {
        id: city.id,
        name: city.name,
        slug: city.slug,
        postalCode: city.postalCode,
        description: city.description,
        cantonId: canton.id,
        metaTitle: `Standesamt ${city.name} - Zivilstandsamt finden`,
        metaDescription: `Informationen zum Standesamt und zur standesamtlichen Trauung in ${city.name}.`
      }
    });
  }

  for (const office of registryOffices) {
    const canton = await prisma.canton.findUniqueOrThrow({ where: { slug: office.cantonSlug } });
    const city = await prisma.city.findUnique({ where: { slug: office.citySlug } });
    await prisma.civilRegistryOffice.upsert({
      where: { slug: office.slug },
      update: {
        name: office.name,
        cantonId: canton.id,
        cityId: city?.id,
        addressLine1: office.addressLine1,
        postalCode: office.postalCode,
        city: office.city,
        phone: office.phone,
        email: office.email,
        websiteUrl: office.websiteUrl,
        appointmentUrl: office.appointmentUrl,
        openingHours: office.openingHours,
        languages: office.languages,
        responsibleMunicipalities: office.responsibleMunicipalities,
        description: office.description,
        documentsInfo: office.documentsInfo,
        ceremonyInfo: office.ceremonyInfo,
        sourceUrl: office.sourceUrl,
        lastVerifiedAt: new Date(office.lastVerifiedAt),
        published: true
      },
      create: {
        name: office.name,
        slug: office.slug,
        cantonId: canton.id,
        cityId: city?.id,
        addressLine1: office.addressLine1,
        postalCode: office.postalCode,
        city: office.city,
        phone: office.phone,
        email: office.email,
        websiteUrl: office.websiteUrl,
        appointmentUrl: office.appointmentUrl,
        openingHours: office.openingHours,
        languages: office.languages,
        responsibleMunicipalities: office.responsibleMunicipalities,
        description: office.description,
        documentsInfo: office.documentsInfo,
        ceremonyInfo: office.ceremonyInfo,
        sourceUrl: office.sourceUrl,
        lastVerifiedAt: new Date(office.lastVerifiedAt),
        published: true,
        metaTitle: `${office.name} - Adresse, Kontakt & Heiraten`,
        metaDescription: `Finde Informationen zu ${office.name}: Adresse, Kontakt, offizielle Website und naechste Schritte fuer die Ziviltrauung.`
      }
    });
  }

  for (const guide of guides) {
    await prisma.guideArticle.upsert({
      where: { slug: guide.slug },
      update: {
        title: guide.title,
        excerpt: guide.excerpt,
        content: guide.content.join("\n\n"),
        status: "published",
        publishedAt: new Date()
      },
      create: {
        title: guide.title,
        slug: guide.slug,
        category: "standesamt",
        excerpt: guide.excerpt,
        content: guide.content.join("\n\n"),
        status: "published",
        author: "hochzeitstandesamt.ch",
        publishedAt: new Date(),
        metaTitle: guide.title,
        metaDescription: guide.excerpt
      }
    });
  }

  for (const vendor of vendors) {
    const canton = await prisma.canton.findUnique({ where: { slug: vendor.cantonSlug } });
    await prisma.vendor.upsert({
      where: { slug: vendor.slug },
      update: {
        companyName: vendor.companyName,
        category: vendor.category,
        cantonId: canton?.id,
        shortDescription: vendor.shortDescription,
        websiteUrl: vendor.websiteUrl,
        priceRange: vendor.priceRange,
        languages: vendor.languages,
        styleTags: vendor.styleTags,
        featured: vendor.featured,
        published: true
      },
      create: {
        companyName: vendor.companyName,
        slug: vendor.slug,
        category: vendor.category,
        email: `kontakt+${vendor.slug}@example.com`,
        cantonId: canton?.id,
        city: vendor.region,
        shortDescription: vendor.shortDescription,
        websiteUrl: vendor.websiteUrl,
        priceRange: vendor.priceRange,
        languages: vendor.languages,
        styleTags: vendor.styleTags,
        featured: vendor.featured,
        published: true
      }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
