"use client";

import { useEffect, useState } from "react";
import PlanifierButton from "@/components/PlanifierButton";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const services = [
    { service: "Ressort cassé", status: "Dispo aujourd'hui", ok: true },
    { service: "Câbles & roulettes", status: "Dispo aujourd'hui", ok: true },
    { service: "Coupe-froid", status: "Dispo aujourd'hui", ok: true },
    { service: "Ouvre-porte", status: "Dispo aujourd'hui", ok: true },
    { service: "Remplacement porte", status: "2–3 jours", ok: false },
  ];

  return (
    <section className="relative overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0 hero-bg" />
      {/* Light overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/60 lg:to-white/30" />

      {/* Subtle red accent top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* LEFT */}
          <div
            className="flex-1 text-center lg:text-left transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand/8 border border-brand/20 text-brand rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              Service disponible maintenant
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] text-[#1a1a1a] uppercase leading-tight mb-5">
              Votre porte de garage{" "}
              <span className="text-brand">ne s&apos;ouvre plus?</span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Nos techniciens interviennent <strong className="text-[#1a1a1a]">le jour même</strong> partout en Estrie et Montérégie. Devis gratuit, travail garanti 2 ans.
            </p>

            {/* Trust row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mb-10">
              {[
                { icon: "⭐", text: "4.9 / 200+ avis Google" },
                { icon: "🛡️", text: "Garantie 2 ans" },
                { icon: "⚡", text: "Intervention rapide" },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                  <span>{b.icon}</span>{b.text}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <PlanifierButton className="bg-brand text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 w-full sm:w-auto">
                Planifier maintenant →
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-gray-200 text-[#1a1a1a] font-bold px-8 py-4 rounded-xl text-base hover:border-brand hover:text-brand transition-all w-full sm:w-auto text-center"
              >
                📞 450-558-5788
              </a>
            </div>
          </div>

          {/* RIGHT — Availability card */}
          <div
            className="w-full lg:w-auto lg:flex-shrink-0 transition-all duration-700 delay-200"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden w-full lg:w-[360px]">

              {/* Card header */}
              <div className="bg-brand px-6 py-4">
                <p className="text-white font-bold text-sm uppercase tracking-widest">Disponibilités</p>
                <p className="text-white/70 text-xs mt-0.5">Mis à jour en temps réel</p>
              </div>

              {/* Services list */}
              <div className="px-6 py-2">
                {services.map((item) => (
                  <div key={item.service} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                    <span className="text-[#1a1a1a] text-sm font-medium">{item.service}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.ok
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-center text-xs text-gray-400 font-medium">
                  Devis gratuit · Sans engagement · Réponse le jour même
                </p>
              </div>
            </div>

            {/* Floating review badge */}
            <div className="mt-4 flex items-center justify-center lg:justify-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex -space-x-2">
                {["#CC0000", "#1a1a1a", "#555"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c }}>
                    {["M", "J", "S"][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">200+ clients satisfaits</p>
                <p className="text-xs text-gray-400">en Estrie & Montérégie</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
