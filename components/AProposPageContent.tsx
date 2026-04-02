"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";

const services = [
  "Réparation de portes de garage (toutes marques)",
  "Installation de portes de garage neuves",
  "Entretien et maintenance",
  "Service d'urgence 24/7",
];

const team = [
  "Techniciens qualifiés et certifiés",
  "Formation continue obligatoire",
  "Nous apprenons les dernières techniques et technologies",
  "Nous ne nous contentons pas de faire «correct» — nous visons l'excellence",
];

const distinctions: { text: string; svg: ReactNode }[] = [
  {
    text: "Équipe moderne avec mentalité de croissance",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2L8 8H4l4 4-1.5 5.5L12 14l5.5 3.5L16 12l4-4h-4L12 2z"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg>,
  },
  {
    text: "On adopte les nouvelles méthodes et technologies",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636-6.364l.707.707M12 21a7 7 0 110-14 7 7 0 010 14z"/><path d="M12 8v4l2 2"/></svg>,
  },
  {
    text: "Transparent : pas de frais cachés, pas de surprises",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/></svg>,
  },
  {
    text: "Service professionnel et rapide",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  },
  {
    text: "Toujours disponible pour apprendre et s'adapter",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M9 7h6M9 11h4"/></svg>,
  },
];

const values = [
  { title: "Excellence", desc: "On veut faire du bon travail. Chaque intervention, chaque fois." },
  { title: "Innovation", desc: "On n'a pas peur du changement. On embrasse ce qui fonctionne mieux." },
  { title: "Apprentissage", desc: "On apprend tous les jours. Pas question de rester sur nos acquis." },
  { title: "Honnêteté", desc: "Prix justes et transparents. Ce qu'on annonce, c'est ce qu'on facture." },
  { title: "Service", desc: "Vous êtes notre priorité. Votre satisfaction, c'est notre résultat." },
];

const reasons = [
  "Équipe qualifiée et en constante formation",
  "Techniciens certifiés qui prennent leur travail au sérieux",
  "Pas de vieilles méthodes dépassées — on utilise ce qu'il y a de mieux",
  "Service 24/7 pour les urgences",
  "Garantie sur nos travaux",
  "Tarifs justes sans frais cachés",
];

const testimonials = [
  { text: "Service professionnel et moderne. C'est rare de nos jours!", name: "Marc T.", city: "Granby" },
  { text: "Ils connaissent leur affaire et m'ont expliqué tout clairement. Aucune surprise.", name: "Véronique L.", city: "Roxton Pond" },
  { text: "Appelé à minuit, ils ont été là le jour même. Impeccable!", name: "Michel D.", city: "Granby" },
];

const d = ["d1","d2","d3","d4","d5","d6"];

export default function AProposPageContent() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-scale");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative secretaire-bg py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#1a1a1a]/80" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <nav className="reveal text-sm text-white/50 mb-6 flex items-center gap-2 justify-center">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/70">À propos</span>
          </nav>
          <h1 className="reveal d1 font-heading text-4xl md:text-5xl text-white uppercase leading-tight mb-4">
            À Propos de <span className="text-brand">Nous</span>
          </h1>
          <p className="reveal d2 text-white/70 text-lg">Vos experts en portes de garage depuis 2010</p>
        </div>
      </section>

      {/* ── 2. NOTRE MISSION ── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Notre mission</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-8 leading-tight">
            Une équipe qui évolue
          </h2>
          <div className="space-y-5 text-gray-600 text-base leading-relaxed">
            <p className="reveal d2">
              Nous ne sommes pas une vieille entreprise figée dans ses habitudes. Nous sommes une équipe de <strong className="text-[#1a1a1a]">techniciens qualifiés qui croit en l&apos;innovation et à l&apos;apprentissage constant</strong>. Chaque jour, nous améliorons nos compétences et nos méthodes.
            </p>
            <p className="reveal d3">
              Notre engagement? Vous offrir un service <strong className="text-[#1a1a1a]">rapide, honnête et moderne</strong>. Pas de vieilles recettes, pas de complacence. On apprend, on s&apos;améliore, et on vous le prouve chaque jour.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. CE QU'ON FAIT ── */}
      <section className="bg-[#f5f5f5] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Nos services</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Ce qu&apos;on fait
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s, i) => (
              <div key={s} className={`reveal-scale ${d[i]} bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm`}>
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[#1a1a1a] font-semibold text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. NOTRE ÉQUIPE ── */}
      <section className="relative py-14 overflow-hidden">
        <div className="absolute inset-0 technicien-bg" />
        <div className="absolute inset-0 bg-[#1a1a1a]/80" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Les gens derrière le travail</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-white uppercase text-center mb-10 leading-tight">
            Notre équipe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((t, i) => (
              <div key={t} className={`reveal-scale ${d[i]} flex items-start gap-4 bg-white/10 border border-white/20 rounded-xl px-5 py-4`}>
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <span className="text-white font-medium text-sm leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CE QUI NOUS DISTINGUE ── */}
      <section className="bg-brand py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-white/70 font-bold text-sm uppercase tracking-widest mb-2 text-center">Notre différence</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-white uppercase text-center mb-10 leading-tight">
            Ce qui nous distingue
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {distinctions.map((dist, i) => (
              <div key={dist.text} className={`reveal-scale ${d[i]} group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl px-5 py-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1`}>
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white group-hover:bg-white/25 transition-colors">
                  {dist.svg}
                </span>
                <span className="text-white text-sm font-medium leading-relaxed pt-2">{dist.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. NOS VALEURS ── */}
      <section className="bg-[#1a1a1a] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Ce en quoi on croit</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-white uppercase text-center mb-10 leading-tight">
            Nos valeurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <div key={v.title} className={`reveal-scale ${d[i]} bg-white/5 border border-white/10 rounded-2xl px-6 py-5`}>
                <p className="font-heading text-brand text-lg uppercase mb-2">{v.title}</p>
                <p className="text-white/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. POURQUOI NOUS CHOISIR ── */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Nos avantages</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Pourquoi nous choisir
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <div key={r} className={`reveal ${d[i]} flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4`}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[#1a1a1a] font-medium text-sm">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. TÉMOIGNAGES ── */}
      <section className="bg-[#f5f5f5] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Ce qu&apos;ils disent</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Témoignages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={t.name} className={`reveal-scale ${d[i]} bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm`}>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-bold text-[#1a1a1a] text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CONTACT ── */}
      <section className="bg-brand py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="reveal font-heading text-2xl md:text-3xl text-white uppercase mb-3 leading-tight">
            Prêt à faire affaire avec une entreprise qui vise l&apos;excellence?
          </h2>
          <p className="reveal d1 text-white/80 mb-8">On est là pour vous. Appelez-nous!</p>
          <a href="tel:4505585788" className="reveal d2 block font-heading text-4xl md:text-5xl text-white uppercase mb-6 hover:text-white/80 transition-colors">
            450-558-5788
          </a>
          <div className="reveal d3">
            <PlanifierButton className="inline-flex items-center gap-2 bg-white text-brand font-bold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors shadow-lg">
              Prendre rendez-vous →
            </PlanifierButton>
          </div>
        </div>
      </section>
    </>
  );
}
