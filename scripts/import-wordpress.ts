import TurndownService from "turndown";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";

const XML_PATH =
  "C:/Users/lambe/Downloads/expertsportesdegarage.WordPress.2026-03-29.xml";
const OUT_DIR = "./content";

const td = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

// Remove SVG, meta, script, style tags entirely
td.remove(["svg", "meta", "script", "style", "noscript"] as Parameters<typeof td.remove>[0]);

function extractCDATA(raw: string): string {
  const match = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return match ? match[1] : raw;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseItems(xml: string) {
  const items: {
    title: string;
    slug: string;
    date: string;
    status: string;
    type: string;
    link: string;
    excerpt: string;
    content: string;
  }[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const get = (tag: string): string => {
      // Handle namespaced tags like content:encoded, wp:post_name etc.
      const tagEscaped = tag.replace(":", "\\:");
      const re = new RegExp(`<${tagEscaped}[^>]*>([\\s\\S]*?)<\\/${tagEscaped}>`, "i");
      const m = block.match(re);
      if (!m) return "";
      return extractCDATA(m[1].trim());
    };

    const type = get("wp:post_type");
    const status = get("wp:status");

    // Only import published pages and posts
    if (!["page", "post"].includes(type)) continue;
    if (!["publish", "draft"].includes(status)) continue;

    const title = get("title");
    const slug = get("wp:post_name") || slugify(title);
    const date = get("wp:post_date").split(" ")[0];
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const excerpt = get("excerpt:encoded");
    const rawContent = get("content:encoded");

    // Clean HTML before converting
    const cleanedHtml = rawContent
      // Remove SVG blocks
      .replace(/<svg[\s\S]*?<\/svg>/gi, "")
      // Remove meta tags
      .replace(/<meta[^>]*>/gi, "")
      // Remove empty tags
      .replace(/<[a-z][^>]*>\s*<\/[a-z][^>]*>/gi, "")
      // Remove Elementor data attributes noise from text
      .replace(/\s+data-start="\d+"|\s+data-end="\d+"/g, "");

    const markdown = rawContent.trim() ? td.turndown(cleanedHtml) : "";

    items.push({ title, slug, date, status, type, link, excerpt, markdown } as any);
  }

  return items;
}

async function main() {
  const xml = await Bun.file(XML_PATH).text();

  const items = parseItems(xml) as any[];

  const pages = items.filter((i) => i.type === "page");
  const posts = items.filter((i) => i.type === "post");

  console.log(`Found ${pages.length} pages, ${posts.length} posts`);

  // Create output dirs
  for (const dir of [`${OUT_DIR}/pages`, `${OUT_DIR}/posts`]) {
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  }

  for (const item of items) {
    const folder = item.type === "post" ? "posts" : "pages";
    const filePath = `${OUT_DIR}/${folder}/${item.slug}.md`;

    const frontmatter = [
      "---",
      `title: "${item.title.replace(/"/g, '\\"')}"`,
      `slug: "${item.slug}"`,
      `date: "${item.date}"`,
      `status: "${item.status}"`,
      `type: "${item.type}"`,
      `link: "${item.link}"`,
      item.excerpt ? `excerpt: "${item.excerpt.replace(/"/g, '\\"').replace(/\n/g, " ")}"` : null,
      "---",
    ]
      .filter(Boolean)
      .join("\n");

    const fileContent = `${frontmatter}\n\n${item.markdown}`;
    await writeFile(filePath, fileContent, "utf-8");
    console.log(`  ✓ ${folder}/${item.slug}.md`);
  }

  console.log("\nDone! Files written to ./content/");
}

main().catch(console.error);
