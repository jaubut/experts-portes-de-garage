import type { MetadataRoute } from "next";
import { getAllPageSlugs } from "@/lib/content";

const BASE_URL = "https://expertsportesdegarage.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllPageSlugs();

  const pages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/services-de-porte-de-garage`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...pages.filter((p) => p.url !== `${BASE_URL}/services-de-porte-de-garage`),
  ];
}
