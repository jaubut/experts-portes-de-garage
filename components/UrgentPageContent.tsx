"use client";

import { useEffect } from "react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/config";
import Image from "next/image";
import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";
import ReviewsSection from "@/components/ReviewsSection";
import FaqAccordion from "@/components/FaqAccordion";

const faqItems = [
  { q: "Ça coûte combien?", a: "Appelez-nous pour un devis gratuit. On évalue la situation et on vous donne un prix clair avant de commencer quoi que ce soit." },
  { q: "Vous venez vraiment le jour même?", a: "Oui, c'est notre engagement. On se déplace le jour même pour les urgences dans notre zone de service." },
  { q: "Vous travaillez la nuit?", a: "Oui, on est disponible 24h/24, 7 jours/7. Une urgence n'attend pas les heures d'ouverture." },
];

const problems = [
  "Porte bloquée ou coincée",
  "Ressorts cassés",
  "Moteur défaillant",
  "Télécommande qui ne marche plus",
  "Bruits étranges (grincements, claquements)",
  "Porte qui s'arrête ou vibre",
];

const whyUs = [
  "Intervention le jour même",
  "Disponible 24h/24, 7 jours/semaine",
  "Équipe qualifiée et expérimentée",
  "Service fiable et rapide",
];

const steps = [
  { num: "1", title: "Appelle ou envoie un message", desc: "Contacte-nous par téléphone ou via le formulaire." },
  { num: "2", title: "On pose quelques questions", desc: "On évalue rapidement la situation pour préparer l'intervention." },
  { num: "3", title: "On arrive aujourd'hui", desc: "Un technicien se déplace le jour même dans ta zone." },
  { num: "4", title: "On répare ton problème", desc: "On diagnostique et règle le problème sur place." },
];

const delays = ["d1", "d2", "d3", "d4", "d5", "d6"];

export default function UrgentPageContent() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-scale");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-brand/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 md:pt-20 pb-10">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">

            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <nav className="text-sm text-white/60 mb-5 flex items-center gap-2 justify-center lg:justify-start reveal">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <span>/</span>
                <span className="text-white/80">Réparation urgente</span>
              </nav>

              <div className="reveal d1 inline-flex items-center gap-2 bg-brand/20 border border-brand/40 text-brand rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
                Urgence 24/7
              </div>

              <h1 className="reveal d2 font-heading text-3xl md:text-5xl text-white uppercase leading-tight mb-4">
                Porte de Garage Bloquée?{" "}
                <span className="text-brand">On Arrive Aujourd&apos;hui!</span>
              </h1>
              <p className="reveal d3 text-white/70 text-base md:text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                Service d&apos;urgence 24/7 — Intervention le jour même en Estrie et Montérégie.
              </p>
              <a
                href={PHONE_HREF}
                className="reveal d4 inline-flex items-center gap-3 bg-brand text-white font-heading text-lg md:text-xl px-8 py-4 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/30 uppercase tracking-wide"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.18 21 3 13.82 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
                </svg>
                Appeler maintenant : {PHONE_DISPLAY}
              </a>
            </div>

            {/* Right — booking card */}
            <div className="reveal d3 w-full lg:min-w-[380px] lg:w-[380px] shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Card header */}
                <div className="bg-brand px-6 py-5 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-black/10" />
                  <div className="relative">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Intervention rapide</p>
                    <p className="font-heading text-white text-xl uppercase leading-tight">Réservez votre service</p>
                  </div>
                </div>

                {/* Divider with badge */}
                <div className="bg-[#1a1a1a] px-6 py-3 flex items-center gap-3">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand animate-heartbeat" />
                  <p className="text-white/70 text-xs font-medium">Service rapide — Réparation ou remplacement</p>
                </div>

                {/* Card body */}
                <div className="bg-[#111] px-6 pt-5 pb-0 flex items-end gap-4">
                  <div className="flex-1 pb-6">
                    <p className="text-white/60 text-sm leading-relaxed mb-5">
                      Choisissez le moment qui vous convient — nos techniciens se déplacent chez vous rapidement.
                    </p>
                    <PlanifierButton className="w-full bg-brand text-white font-heading text-sm uppercase px-4 py-3 rounded-xl hover:bg-brand-dark transition-colors tracking-wide shadow-lg shadow-brand/20">
                      Planifier une réparation
                    </PlanifierButton>
                    <a href={PHONE_HREF} className="flex items-center justify-center gap-2 mt-3 text-white/40 hover:text-white/70 transition-colors text-xs font-medium">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.18 21 3 13.82 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" /></svg>
                      ou appeler {PHONE_DISPLAY}
                    </a>
                  </div>
                  <div className="w-28 shrink-0 flex items-end justify-center">
                    <Image src="/images/personnage_transparent2.png" alt="" width={112} height={160} className="h-40 w-auto object-contain object-bottom" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. POURQUOI NOUS ── */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Pourquoi nous choisir</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Notre engagement envers vous
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyUs.map((item, i) => (
              <div key={item} className={`reveal-scale ${delays[i]} flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4`}>
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[#1a1a1a] font-semibold text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PROBLÈMES QU'ON RÉPARE ── */}
      <section className="bg-[#f5f5f5] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Nos interventions</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Problèmes qu&apos;on répare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {problems.map((p, i) => (
              <div key={p} className={`reveal-scale ${delays[i]} bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm`}>
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand" />
                <span className="text-[#1a1a1a] text-sm font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. COMMENT ÇA MARCHE ── */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Simple et rapide</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className={`reveal ${delays[i]} flex flex-col items-center text-center gap-3`}>
                <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
                  <span className="font-heading text-white text-xl">{s.num}</span>
                </div>
                <p className="font-bold text-[#1a1a1a] text-sm">{s.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. ZONES DESSERVIES ── */}
      <section className="bg-brand py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="reveal text-white/80 text-sm font-bold uppercase tracking-widest mb-2">Zone de service</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-white uppercase leading-tight mb-3">Zones desservies</h2>
          <div className="reveal-scale d2 inline-flex items-center gap-3 bg-white/15 border border-white/30 rounded-2xl px-6 py-4 mt-2">
            <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white font-bold text-lg">Granby et rayon de 45 km</p>
          </div>
          <p className="reveal d3 text-white/70 text-sm mt-4">Estrie · Montérégie · Rive-Sud</p>
        </div>
      </section>

      {/* ── 6. CONTACT PRINCIPAL ── */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="reveal text-brand font-bold text-sm uppercase tracking-widest mb-2">Contactez-nous</p>
          <h2 className="reveal d1 font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase mb-8 leading-tight">On est là pour vous</h2>
          <a href={PHONE_HREF} className="reveal d2 block font-heading text-4xl md:text-5xl text-brand uppercase mb-2 hover:text-brand-dark transition-colors">
            {PHONE_DISPLAY}
          </a>
          <p className="reveal d3 text-gray-400 text-sm mb-8">Disponible 24h/24 · 7 jours/7</p>
          <div className="reveal d4 flex flex-col sm:flex-row gap-3 justify-center">
            <PlanifierButton className="bg-brand text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20">
              Demander un devis →
            </PlanifierButton>
            <a href="mailto:info@expertsportesdegarage.ca" className="border-2 border-brand text-brand font-bold px-8 py-4 rounded-xl text-base hover:bg-brand hover:text-white transition-colors text-center">
              info@expertsportesdegarage.ca
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. AVIS CLIENTS ── */}
      <ReviewsSection />

      {/* ── 8. FAQ ── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="reveal font-heading text-2xl md:text-3xl text-brand text-center uppercase mb-10">Questions fréquentes</h2>
          <div className="reveal d1">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>
    </>
  );
}
