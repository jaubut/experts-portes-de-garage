"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/config";

const avantages = [
  {
    title: "Salaire et avantages",
    icon: (
      <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: "Chez nous, on reconnaît la valeur de ton travail. Tu es payé chaque semaine, tu profites de congés payés et d'un ensemble d'avantages conçus pour soutenir ton bien-être et celui de ta famille.",
  },
  {
    title: "Opportunités d'avancement",
    icon: (
      <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    desc: "Ici, on t'aide à bâtir une vraie carrière, pas juste un emploi. Avec notre culture de promotion interne et nos formations continues, ton développement professionnel est une priorité. Ton succès, c'est aussi le nôtre.",
  },
  {
    title: "Culture d'entreprise",
    icon: (
      <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    desc: "On mise sur une équipe soudée, un climat de confiance et un environnement où tout le monde avance ensemble. Depuis le premier jour, on travaille côte à côte pour offrir le meilleur service à nos clients — et le meilleur milieu de travail à nos employés.",
  },
];

const traits = [
  "Voir un problème, le régler — Tu es proactif et tu prends des initiatives.",
  "Penser client avant tout — Tu aimes vraiment aider les gens.",
  "Aimer apprendre et t'améliorer — Tu apprends vite et tu mets tes nouvelles connaissances en pratique.",
  "Être motivé et ambitieux — Tu veux toujours progresser et inspirer les autres autour de toi.",
  "Aimer faire partie d'une équipe gagnante — Tu donnes ton 100 % et tu célèbres les réussites collectives.",
];

const perks = [
  {
    label: "Formation payée",
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
      </svg>
    ),
  },
  {
    label: "Camion de compagnie",
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Outils fournis",
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    label: "Carte d'essence",
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
        <path d="M3 22h12M15 8h2a2 2 0 012 2v2a2 2 0 002 2h0V9l-3-3" />
        <path d="M7 8h4M7 12h4" />
      </svg>
    ),
  },
];

const d = ["d1", "d2", "d3", "d4", "d5", "d6"];

export default function CarrierePageContent() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    const els = document.querySelectorAll(".reveal, .reveal-scale, .reveal-left");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* ── 1. HERO ── */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="absolute inset-0 smiling-technicien-bg" />
        <div className="absolute inset-0 bg-[#1a1a1a]/70" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <nav className="reveal text-sm text-white/50 mb-6 flex items-center gap-2 justify-center">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/70">Carrière</span>
          </nav>
          <h1 className="reveal d1 font-heading text-4xl md:text-5xl text-white uppercase leading-tight mb-5">
            Bâtis ta carrière <span className="text-brand">chez nous</span>
          </h1>
          <p className="reveal d2 text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Rejoins une équipe d&apos;experts passionnés — techniciens, installateurs et gestionnaires — qui contribuent chaque jour à faire grandir une entreprise locale en pleine expansion partout en Estrie et en Montérégie.
          </p>
        </div>
      </section>

      {/* ── 2. UN TRAVAIL VALORISANT ── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Ce qu&apos;on offre</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-12 leading-tight">
            Un travail valorisant
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {avantages.map((a, i) => (
              <div key={a.title} className={`reveal-scale ${d[i]} bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-4`}>
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
                  {a.icon}
                </div>
                <p className="font-heading text-lg text-[#1a1a1a] uppercase">{a.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. TECHNICIENS SUR LE TERRAIN ── */}
      <section className="bg-brand py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <p className="reveal text-white/70 font-bold text-sm uppercase tracking-widest mb-3">Poste disponible</p>
              <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-white uppercase leading-tight mb-4">
                Techniciens sur le terrain
              </h2>
              <p className="reveal d2 text-white/80 text-base leading-relaxed">
                Apprends un vrai métier au sein d&apos;une équipe d&apos;experts. Formation payée, camion de compagnie, outils fournis et carte d&apos;essence — tout pour que tu sois prêt à performer dès le jour 1.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {perks.map((p, i) => (
                <div key={p.label} className={`reveal-scale ${d[i]} bg-white/15 border border-white/25 rounded-xl px-4 py-3 flex items-center gap-3`}>
                  <span className="flex-shrink-0">{p.icon}</span>
                  <span className="text-white font-semibold text-sm">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. DEVENEZ UN EXPERT ── */}
      <section className="bg-[#f5f5f5] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Formation & croissance</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-8 leading-tight">
            Devenez un expert en portes de garage
          </h2>
          <div className="space-y-5 text-gray-600 text-base leading-relaxed">
            <p className="reveal d2">Chez nous, on croit qu&apos;un bon technicien, ça se forme. C&apos;est pourquoi on offre une <strong className="text-[#1a1a1a]">formation pratique complète</strong>, directement sur le terrain, pour t&apos;apprendre tout ce qu&apos;il faut — de l&apos;entretien à l&apos;installation, en passant par la relation client et l&apos;utilisation de nos outils technologiques.</p>
            <p className="reveal d3">Mais on ne t&apos;enseigne pas juste quoi faire : on t&apos;explique <strong className="text-[#1a1a1a]">pourquoi on le fait</strong>. Tu apprendras à comprendre le fonctionnement complet d&apos;une porte de garage — ressorts, câbles, rails, ouvre-portes et systèmes de sécurité — pour pouvoir diagnostiquer et résoudre chaque problème avec précision.</p>
            <p className="reveal d4">Tu seras accompagné par des techniciens d&apos;expérience qui te guideront pas à pas, jusqu&apos;à ce que tu sois capable d&apos;intervenir seul, avec confiance et professionnalisme.</p>
            <p className="reveal d5">On mise sur un <strong className="text-[#1a1a1a]">apprentissage concret, humain et progressif</strong>, adapté à ton rythme et à ton niveau.</p>
            <p className="reveal d6">Chez nous, on ne cherche pas juste des employés : on forme des experts. Des gens curieux, travaillants et fiers de bien faire les choses. Et si tu veux avancer, on t&apos;ouvre la voie — vers des postes de <strong className="text-[#1a1a1a]">chef d&apos;équipe, de formateur ou même de gestion de projets</strong>.</p>
          </div>
        </div>
      </section>

      {/* ── 5. TU ES FAIT POUR NOUS ── */}
      <section className="bg-[#1a1a1a] py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Profil recherché</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-white uppercase text-center mb-10 leading-tight">
            Tu es fait pour faire partie de l&apos;équipe si tu :
          </h2>
          <div className="flex flex-col gap-4">
            {traits.map((t, i) => (
              <div key={t} className={`reveal ${d[i]} flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4`}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90 text-sm leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA ── */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="reveal font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase mb-3 leading-tight">
            Prêt à rejoindre nos équipes?
          </h2>
          <p className="reveal d1 text-gray-500 mb-8">Nos techniciens se déplacent rapidement partout en Estrie et Montérégie.</p>
          <a
            href={PHONE_HREF}
            className="reveal d2 inline-flex items-center gap-3 bg-brand text-white font-heading text-lg md:text-xl px-8 py-4 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20 uppercase tracking-wide mb-4"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.18 21 3 13.82 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
            Appeler maintenant : {PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </div>
  );
}
