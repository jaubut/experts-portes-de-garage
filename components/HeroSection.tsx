"use client";

import { useEffect, useState } from "react";
import PlanifierButton from "@/components/PlanifierButton";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const services = [
    "Ressort cassé ou brisé",
    "Câbles & roulettes",
    "Coupe-froid & joints",
    "Ouvre-porte motorisé",
    "Remplacement de porte",
  ];

  return (
    <section className="relative overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0 hero-bg" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/60 lg:to-white/30" />

      {/* Red accent top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* LEFT */}
          <div
            className="flex-1 text-center lg:text-left transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
          >
            {/* Zone label */}
            <div className="inline-flex items-center gap-2 bg-brand/8 border border-brand/20 text-brand rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              Estrie &amp; Montérégie
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] text-[#1a1a1a] uppercase leading-tight mb-5">
              Votre porte de garage{" "}
              <span className="text-brand">ne s&apos;ouvre plus?</span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              On se déplace rapidement en Estrie et Montérégie pour diagnostiquer et réparer votre porte de garage.{" "}
              <strong className="text-[#1a1a1a]">Devis gratuit, sans engagement.</strong>
            </p>

            {/* Honest trust row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mb-10">
              {[
                { icon: "🛡️", text: "Garantie 2 ans" },
                { icon: "📋", text: "Devis gratuit" },
                { icon: "⚡", text: "Déplacement rapide" },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                  <span>{b.icon}</span>{b.text}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <PlanifierButton className="bg-brand text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 w-full sm:w-auto">
                Planifier une visite →
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-gray-200 text-[#1a1a1a] font-bold px-8 py-4 rounded-xl text-base hover:border-brand hover:text-brand transition-all w-full sm:w-auto text-center"
              >
                📞 450-558-5788
              </a>
            </div>
          </div>

          {/* RIGHT — Services card */}
          <div
            className="w-full lg:w-auto lg:flex-shrink-0 transition-all duration-700 delay-200"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden w-full lg:w-[340px]">

              {/* Card header */}
              <div className="bg-brand px-6 py-4">
                <p className="text-white font-bold text-sm uppercase tracking-widest">Ce qu&apos;on répare</p>
                <p className="text-white/70 text-xs mt-0.5">Portes de garage résidentielles</p>
              </div>

              {/* Services list */}
              <div className="px-6 py-3">
                {services.map((item) => (
                  <div key={item} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center">
                      <svg className="w-3 h-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-[#1a1a1a] text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              {/* Card footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-center text-xs text-gray-400 font-medium">
                  Devis gratuit · Sans engagement · Réponse rapide
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
