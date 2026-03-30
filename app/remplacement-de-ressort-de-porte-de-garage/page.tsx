import { getPageBySlug } from "@/lib/content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";
import ReviewsSection from "@/components/ReviewsSection";
import FaqAccordion from "@/components/FaqAccordion";
import GallerySection from "@/components/GallerySection";

const SLUG = "remplacement-de-ressort-de-porte-de-garage";

const HERO_BG =
  "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-16_30_47-1024x683.webp";
const LOGO_SRC =
  "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-14_03_41.webp";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPageBySlug(SLUG);
  if (!page) return {};
  return {
    title: `${page.title} — Experts Portes de Garage`,
    description: page.excerpt,
  };
}

export default function RemplacementDeRessortDePorteDeGaragePage() {
  const page = getPageBySlug(SLUG);
  if (!page) notFound();

  return (
    <>
      {/* ── 1. HERO + URGENCY BAR ── */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      >
        <div className="absolute inset-0 bg-black/65" />

        {/* Main two-column content */}
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase leading-tight mb-5">
                {page.title}
              </h1>
              {page.excerpt && (
                <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {page.excerpt}
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
                    width={180}
                    height={60}
                    className="h-12 w-auto object-contain brightness-0 invert shrink-0"
                  />
                  <span className="text-white font-bold text-sm text-right leading-tight">
                    Réservez votre service
                  </span>
                </div>
                <div className="bg-[#aa0000] px-5 py-2.5">
                  <p className="text-white/95 text-sm text-center font-medium">
                    Service rapide de porte de garage – Réparation ou remplacement.
                  </p>
                </div>
                <div className="px-6 py-6">
                  <p className="text-gray-600 leading-relaxed text-sm mb-6">
                    Faites-nous savoir ce dont vous avez besoin, choisissez le
                    moment qui vous convient le mieux, et nous serons sur place.
                    C&apos;est aussi simple que ça!
                  </p>
                  <PlanifierButton className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                    Planifier une réparation
                  </PlanifierButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. URGENCY BAR ── */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-white border-l-4 border-brand rounded-xl shadow-xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-extrabold text-brand text-base leading-snug">
                Urgence ? Obtenez une réparation rapide 24h/24 par nos experts certifiés dès maintenant!
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Nos techniciens qualifiés sont disponibles en tout temps
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <PlanifierButton className="bg-brand text-white font-bold px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm whitespace-nowrap">
                📅 Planifier une inspection
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-brand text-brand font-bold px-5 py-2.5 rounded-lg hover:bg-brand hover:text-white transition-colors text-sm whitespace-nowrap text-center"
              >
                📞 Appeler maintenant → 450-558-5788
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN CONTENT ── */}
      <div className="bg-white pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ src, alt }) =>
                src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={alt ?? ""}
                    className="rounded-xl max-w-full h-auto my-8 shadow-sm"
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
                <h1 className="text-3xl font-extrabold text-brand text-center mt-2 mb-8">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-brand mt-12 mb-4 pb-2 border-b-2 border-brand/20">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 leading-relaxed text-gray-700 text-[1.02rem]">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-none pl-0 mb-6 flex flex-col gap-2 text-gray-700">
                  {children}
                </ul>
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
            }}
          >
            {page.bodyContent}
          </ReactMarkdown>

          {/* Mid-page CTA */}
          <div className="mt-4 bg-muted rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-bold text-lg text-[#1a1a1a] mb-1">
                Prêt à planifier votre service?
              </p>
              <p className="text-gray-500 text-sm">
                Nos techniciens se déplacent rapidement partout en Estrie et Montérégie.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <PlanifierButton className="bg-brand text-white font-bold px-5 py-3 rounded hover:bg-brand-dark transition-colors text-sm">
                Planifier maintenant
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-brand text-brand font-bold px-5 py-3 rounded hover:bg-brand hover:text-white transition-colors text-sm"
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand text-center mb-10">
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
