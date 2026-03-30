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

export interface FaqItem {
  q: string;
  a: string;
}

export interface PageData {
  slug: string;
  title: string;
  date: string;
  status: string;
  link: string;
  excerpt?: string;
  content: string;       // original full content
  bodyContent: string;   // cleaned: booking widget + reviews/FAQ/gallery stripped
  faq: FaqItem[];
}

/** Strip booking widget, embedded reviews, FAQ, and gallery from markdown */
function getBodyContent(raw: string): string {
  let content = raw;

  // Remove logo image line
  content = content.replace(/!\[\]\(https?:\/\/[^\)]*logo_experts_blanc[^\)]*\)\s*/g, "");

  // Remove "## Réservez votre service" section (up to the next ## heading)
  const réservezIdx = content.indexOf("## Réservez votre service");
  if (réservezIdx >= 0) {
    const nextH2 = content.indexOf("\n## ", réservezIdx + 4);
    if (nextH2 > réservezIdx) {
      content = content.slice(0, réservezIdx) + content.slice(nextH2 + 1);
    } else {
      content = content.slice(0, réservezIdx);
    }
  }

  // Stop before embedded reviews / FAQ / gallery sections
  const STOP_MARKERS = [
    "\n## Avis de nos clients",
    "\n## AVIS DE NOS CLIENTS",
    "\n## FOIRE AUX QUESTIONS",
    "\n## Foire aux questions",
    "\n## FAQ sur",
    "\n## Parcourez notre galerie",
    "\n## INSPIRATION",
  ];

  let stopIdx = content.length;
  for (const marker of STOP_MARKERS) {
    const idx = content.indexOf(marker);
    if (idx > 0 && idx < stopIdx) stopIdx = idx;
  }

  return content.slice(0, stopIdx).trim();
}

/** Parse FAQ Q&A pairs from the FOIRE AUX QUESTIONS / FAQ section */
function parseFaq(raw: string): FaqItem[] {
  // Find the FAQ heading
  const headingRe = /##[^\n]*(foire aux questions|faq sur|questions fréquentes)/i;
  const headingMatch = headingRe.exec(raw);
  if (!headingMatch) return [];

  const start = headingMatch.index + headingMatch[0].length;

  // Stop before gallery / inspiration section or end of content
  let end = raw.length;
  for (const marker of ["## Parcourez notre galerie", "## INSPIRATION", "## Parcourez"]) {
    const idx = raw.indexOf(marker, start);
    if (idx > start && idx < end) end = idx;
  }

  const faqText = raw.slice(start, end).trim();
  const paras = faqText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const items: FaqItem[] = [];
  const seen = new Set<string>();

  let i = 0;
  while (i < paras.length - 1) {
    const para = paras[i];

    // A question paragraph: entire paragraph ends with ? (possibly followed by whitespace)
    if (/\?\s*$/.test(para) && !para.startsWith("-") && !para.startsWith("*")) {
      // Clean the question: take only up to (and including) the last ?
      const lastQ = para.lastIndexOf("?");
      const q = para.slice(0, lastQ + 1).trim();

      if (seen.has(q)) break; // hit duplicate block
      seen.add(q);

      const answer = paras[i + 1] ?? "";
      items.push({ q, a: answer });
      i += 2;
    } else {
      i++;
    }
  }

  return items;
}

/** Extract the first real paragraph (skip h1 and logo/widget lines) */
function extractExcerpt(raw: string): string {
  const lines = raw.split("\n");
  let collecting = false;
  const paragraphLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines when not collecting
    if (!trimmed) {
      if (collecting && paragraphLines.length > 0) break;
      continue;
    }

    // Skip headings, images, inline buttons, markdown links-only lines
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("![]") ||
      trimmed === "Planifier une réparation" ||
      trimmed === "Planifier maintenant" ||
      trimmed.startsWith("Planifier une inspection") ||
      trimmed.startsWith("■")
    ) {
      if (collecting) break;
      continue;
    }

    collecting = true;
    paragraphLines.push(trimmed);
  }

  return paragraphLines
    .join(" ")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .slice(0, 220)
    .trim();
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

  const excerpt = data.excerpt ?? extractExcerpt(content);

  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    status: data.status ?? "",
    link: data.link ?? "",
    excerpt,
    content,
    bodyContent: getBodyContent(content),
    faq: parseFaq(content),
  };
}

export function getHomePage(): PageData | null {
  return getPageBySlug("home");
}
