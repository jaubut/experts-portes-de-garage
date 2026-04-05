import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dicter/", "/api/"],
    },
    sitemap: "https://www.expertsportesdegarage.ca/sitemap.xml",
  };
}
