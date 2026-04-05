import type { MetadataRoute } from "next";
import { getAllPageSlugs } from "@/lib/content";

const BASE_URL = "https://www.expertsportesdegarage.ca";

const CITY_SLUGS = [
  "portes-de-garage-granby",
  "portes-de-garage-sherbrooke",
  "portes-de-garage-saint-hyacinthe",
  "portes-de-garage-longueuil",
  "portes-de-garage-brossard",
  "portes-de-garage-magog",
  "portes-de-garage-saint-jean-sur-richelieu",
  "portes-de-garage-bromont",
  "portes-de-garage-waterloo",
];

const SERVICE_SLUGS = [
  "installation-de-nouvelle-porte-de-garage",
  "reparation-urgente-de-porte-de-garage",
  "reparation-ouvre-porte-de-garage",
  "remplacement-coupe-froid-porte-de-garage",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const allSlugs = getAllPageSlugs();
  const otherSlugs = allSlugs.filter(
    (slug) => !CITY_SLUGS.includes(slug) && !SERVICE_SLUGS.includes(slug)
  );

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
      lastModified: new Date(),
    },
    // Pages services — haute priorité
    ...SERVICE_SLUGS.map((slug) => ({
      url: `${BASE_URL}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      lastModified: new Date(),
    })),
    // Pages villes — haute priorité SEO local
    ...CITY_SLUGS.map((slug) => ({
      url: `${BASE_URL}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
      lastModified: new Date(),
    })),
    // Autres pages
    ...otherSlugs.map((slug) => ({
      url: `${BASE_URL}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: new Date(),
    })),
  ];
}
