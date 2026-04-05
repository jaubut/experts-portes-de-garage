import { getAllBlogPosts } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";
import { PHONE_HREF, PHONE_DISPLAY } from "@/lib/config";

const BASE_URL = "https://www.expertsportesdegarage.ca";

export const metadata: Metadata = {
  title: "Blogue — Conseils portes de garage | Experts Portes de Garage",
  description:
    "Conseils d'experts sur la réparation, l'entretien et l'installation de portes de garage au Québec. Guides pratiques, prix, et astuces pour prolonger la vie de votre porte.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Réparation: "bg-red-50 text-red-700 border-red-200",
  Budget: "bg-green-50 text-green-700 border-green-200",
  Entretien: "bg-blue-50 text-blue-700 border-blue-200",
  Installation: "bg-purple-50 text-purple-700 border-purple-200",
  Technologie: "bg-orange-50 text-orange-700 border-orange-200",
  Conseils: "bg-gray-50 text-gray-700 border-gray-200",
  "Ouvre-porte": "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      {/* ── HERO ── */}
      <section className="bg-[#1a1a1a] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-brand/15 border border-brand/30 text-brand text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Blogue
          </span>
          <h1 className="font-heading text-3xl md:text-4xl text-white uppercase mb-4">
            Conseils & Guides pour vos Portes de Garage
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Des articles pratiques rédigés par nos techniciens — pour comprendre, prévenir et régler les problèmes de portes de garage au Québec.
          </p>
        </div>
      </section>

      {/* ── ARTICLES ── */}
      <section className="bg-[#f5f5f5] py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500">Aucun article disponible pour l&apos;instant.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {posts.map((post) => {
                const categoryColor =
                  CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS["Conseils"];
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    {/* Card header */}
                    <div className="bg-brand px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${categoryColor}`}
                        >
                          {post.category}
                        </span>
                        <span className="text-white/70 text-xs">{post.readTime} de lecture</span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-6 py-5 flex flex-col flex-1">
                      <h2 className="font-bold text-[#1a1a1a] text-lg leading-snug mb-3 group-hover:text-brand transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1">
                        {post.excerpt}
                      </p>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(post.date).toLocaleDateString("fr-CA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-brand text-sm font-semibold group-hover:underline">
                          Lire l&apos;article →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-brand py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl md:text-3xl text-white uppercase mb-3">
            Un problème avec votre porte de garage?
          </h2>
          <p className="text-white/80 mb-8">
            Nos techniciens interviennent rapidement partout en Estrie et Montérégie.
          </p>
          <a
            href={PHONE_HREF}
            className="inline-block bg-white text-brand font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            {PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </>
  );
}
