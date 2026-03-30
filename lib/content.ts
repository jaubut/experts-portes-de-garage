import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PAGES_DIR = path.join(process.cwd(), "content/pages");

// Slugs to exclude (Elementor templates, test pages, duplicates)
const EXCLUDED_SLUGS = new Set([
  "elementor-1246",
  "elementor-3146",
  "test-caroussel-1",
  "coupe-froid-porte-de-garage-v2",
  "coupe-froid-porte-de-garage",
]);

export interface PageData {
  slug: string;
  title: string;
  date: string;
  status: string;
  link: string;
  excerpt?: string;
  content: string;
}

export function getAllPageSlugs(): string[] {
  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .filter((slug) => slug !== "home" && !EXCLUDED_SLUGS.has(slug));
}

export function getPageBySlug(slug: string): PageData | null {
  const filePath = path.join(PAGES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    status: data.status ?? "",
    link: data.link ?? "",
    excerpt: data.excerpt,
    content,
  };
}

export function getHomePage(): PageData | null {
  return getPageBySlug("home");
}
