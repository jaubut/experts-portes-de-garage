import { getPageBySlug } from "@/lib/content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Components } from "react-markdown";
import Image from "next/image";
import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";
import ReviewsSection from "@/components/ReviewsSection";
import FaqAccordion from "@/components/FaqAccordion";
import GallerySection from "@/components/GallerySection";
import InspectionBanner from "@/components/InspectionBanner";

const SLUG = "carriere";

const HERO_BG =
  "/images/gallery-5.webp";
const LOGO_SRC =
  "/images/logo.webp";

type ContentBlock =
  | { kind: "text"; content: string }
  | { kind: "image-text"; imageUrl: string; alt: string; text: string };

function parseContentBlocks(markdown: string): ContentBlock[] {
  const paras = markdown.split(/\n\n+/);
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < paras.length) {
    const para = paras[i].trim();
    if (!para) { i++; continue; }

    const imgMatch = para.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch && i + 1 < paras.length) {
      const next = paras[i + 1].trim();
      if (next && !next.startsWith("#") && !next.match(/^!\[/)) {
        blocks.push({ kind: "image-text", alt: imgMatch[1], imageUrl: imgMatch[2], text: next });
        i += 2;
        continue;
      }
    }

    const last = blocks[blocks.length - 1];
    if (last?.kind === "text") {
      last.content += "\n\n" + para;
    } else {
      blocks.push({ kind: "text", content: para });
    }
    i++;
  }

  return blocks;
}

function extractFullExcerpt(raw: string): string {
  const lines = raw.split("\n");
  let collecting = false;
  const paragraphLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (collecting && paragraphLines.length > 0) break;
      continue;
    }
    if (trimmed.startsWith("#") || trimmed.startsWith("![]") || trimmed.startsWith("Planifier")) {
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
    .trim();
}

const mdComponents: Components = {
  img: ({ src, alt }) =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src as string}
        alt={(alt as string) ?? ""}
        className="rounded-lg max-w-full h-auto my-4 shadow-sm"
      />
    ) : null,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-brand font-semibold hover:underline"
      {...(href?.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <h1 className="font-heading text-3xl text-brand text-center mt-2 mb-8 uppercase">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-2xl text-brand mt-12 mb-4 pb-2 border-b-2 border-brand/20 uppercase">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 leading-relaxed text-gray-700 text-[1.02rem]">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-none pl-0 mb-6 flex flex-col gap-2 text-gray-700">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2.5 leading-relaxed">
      <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-brand" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-[#1a1a1a]">{children}</strong>
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  const page = getPageBySlug(SLUG);
  if (!page) return {};
  return {
    title: `${page.title} — Experts Portes de Garage`,
    description: page.excerpt,
  };
}

export default function CarrierePage() {
  const page = getPageBySlug(SLUG);
  if (!page) notFound();

  const heroExcerpt = extractFullExcerpt(page.content);

  return (
    <>
      {/* ── 1. HERO ── */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      >
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 md:pt-20 pb-10">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
            {/* Left — title + excerpt */}
            <div className="flex-1 text-center lg:text-left">
              <nav className="text-sm text-white/60 mb-5 flex items-center gap-2 justify-center lg:justify-start">
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
                <span>/</span>
                <span className="text-white/80">{page.title}</span>
              </nav>
              <h1 className="font-heading text-3xl md:text-4xl text-white uppercase leading-tight mb-5">
                {page.title}
              </h1>
              {heroExcerpt && (
                <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {heroExcerpt}
                </p>
              )}
            </div>

            {/* Right — booking card */}
            <div className="w-full lg:min-w-[420px] lg:w-[420px] shrink-0">
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-brand px-5 py-4 flex items-center justify-between gap-3">
                  <Image
                    src={LOGO_SRC}
                    alt="Experts Portes de Garage"
                    width={160}
                    height={52}
                    className="h-10 w-auto object-contain brightness-0 invert shrink-0"
                  />
                  <span className="font-heading text-white text-sm text-right leading-tight uppercase">
                    Réservez votre service
                  </span>
                </div>
                <div className="bg-brand-dark px-5 py-2">
                  <p className="text-white/90 text-xs text-center font-medium">
                    Service rapide de porte de garage — Réparation ou remplacement.
                  </p>
                </div>
                <div className="px-5 pt-4 pb-0">
                  <p className="text-gray-600 leading-snug text-sm mb-3">
                    Faites-nous savoir ce dont vous avez besoin, choisissez le
                    moment qui vous convient le mieux, et nous serons sur place.
                  </p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 pb-4">
                      <PlanifierButton className="w-full bg-brand text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                        Planifier une réparation
                      </PlanifierButton>
                    </div>
                    <div className="w-24 shrink-0 flex items-end justify-center">
                      <Image
                        src="/images/equipe.webp"
                        alt=""
                        width={96}
                        height={130}
                        className="h-32 w-auto object-contain object-bottom"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. INSPECTION BANNER ── */}
      <InspectionBanner />

      {/* ── 3. MAIN CONTENT ── */}
      <div className="bg-white pt-10">
        {parseContentBlocks(page.bodyContent).map((block, idx) =>
          block.kind === "image-text" ? (
            <div key={idx} className="px-6 md:px-16 lg:px-24 py-6 flex flex-col sm:flex-row items-start gap-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.imageUrl}
                alt={block.alt}
                className="w-full sm:w-1/3 sm:h-[250px] object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {block.text}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div key={idx} className="max-w-4xl mx-auto px-4 sm:px-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {block.content}
              </ReactMarkdown>
            </div>
          )
        )}

        {/* Mid-page CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
          <div className="mt-6 bg-muted rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-heading text-lg text-brand uppercase mb-1">
                Prêt à planifier votre service?
              </p>
              <p className="text-gray-500 text-sm">
                Nos techniciens se déplacent rapidement partout en Estrie et Montérégie.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <PlanifierButton className="bg-brand text-white font-bold px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                Planifier maintenant
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-brand text-brand font-bold px-5 py-3 rounded-lg hover:bg-brand hover:text-white transition-colors text-sm"
              >
                450-558-5788
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. REVIEWS ── */}
      <ReviewsSection />

      {/* ── 5. FAQ ACCORDION ── */}
      {page.faq.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading text-2xl md:text-3xl text-brand text-center uppercase mb-10">
              Foire aux questions
            </h2>
            <FaqAccordion items={page.faq} />
          </div>
        </section>
      )}

      {/* ── 6. GALLERY ── */}
      <GallerySection />
    </>
  );
}
