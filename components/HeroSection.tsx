"use client";

import { useEffect, useState } from "react";
import PlanifierButton from "@/components/PlanifierButton";

export default function HeroSection() {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    let start = 0;
    const end = 247;
    const step = Math.ceil(end / (1800 / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-[#0a0a0a] min-h-screen flex items-center overflow-hidden">

      {/* Grid texture */}
      <div className="absolute inset-0" style={{
        backgroundImage: [
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "60px 60px",
      }} />

      {/* Red diagonal slash */}
      <div
        className="absolute top-0 right-[38%] w-[3px] h-full bg-brand hidden lg:block"
        style={{ transform: "rotate(8deg) translateX(50%)", transformOrigin: "top center" }}
      />

      {/* Top red bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand" />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #CC0000 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* LEFT */}
          <div className="flex-1 text-center lg:text-left">

            {/* Live badge */}
            <div
              className="inline-flex items-center gap-2 mb-8 transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
              </span>
              <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
                Service actif — Granby & régions
              </span>
            </div>

            {/* Headline */}
            <div
              className="mb-6 transition-all duration-700 delay-100"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
            >
              <h1 className="font-heading uppercase leading-[0.9] text-white">
                <span className="block text-5xl md:text-7xl lg:text-8xl">Votre porte</span>
                <span className="block text-5xl md:text-7xl lg:text-8xl">de garage</span>
                <span className="block text-5xl md:text-7xl lg:text-8xl text-brand">bloquée?</span>
              </h1>
            </div>

            {/* Subtext */}
            <p
              className="text-white/50 text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto lg:mx-0 transition-all duration-700 delay-200"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
            >
              Techniciens certifiés. Intervention le jour même.
              Résultat garanti dès la première visite — ou c&apos;est gratuit.
            </p>

            {/* Stats row */}
            <div
              className="flex flex-wrap justify-center lg:justify-start gap-8 mb-10 transition-all duration-700 delay-300"
              style={{ opacity: visible ? 1 : 0 }}
            >
              {[
                { value: `${count}+`, label: "clients cette année" },
                { value: "4.9★", label: "sur Google" },
                { value: "2 ans", label: "de garantie" },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-white font-heading">{s.value}</p>
                  <p className="text-white/40 text-xs uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transitionDelay: "400ms" }}
            >
              <PlanifierButton className="bg-brand text-white font-bold px-8 py-4 rounded-none text-sm uppercase tracking-widest hover:bg-brand-dark transition-all shadow-[4px_4px_0px_rgba(204,0,0,0.3)] hover:shadow-[2px_2px_0px_rgba(204,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] w-full sm:w-auto">
                Planifier maintenant →
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border border-white/20 text-white/70 font-bold px-8 py-4 rounded-none text-sm uppercase tracking-widest hover:border-white hover:text-white transition-all w-full sm:w-auto text-center"
              >
                ☎ 450-558-5788
              </a>
            </div>
          </div>

          {/* RIGHT — availability card */}
          <div
            className="flex-shrink-0 w-full lg:w-[400px] transition-all duration-1000"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(40px)", transitionDelay: "500ms" }}
          >
            <div className="border border-white/10 bg-white/[0.02] p-6 relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand" />

              <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-5">Disponibilité en temps réel</p>

              <div className="space-y-0">
                {[
                  { service: "Ressort cassé", status: "Dispo aujourd'hui", ok: true },
                  { service: "Câbles & roulettes", status: "Dispo aujourd'hui", ok: true },
                  { service: "Coupe-froid", status: "Dispo aujourd'hui", ok: true },
                  { service: "Ouvre-porte", status: "Dispo aujourd'hui", ok: true },
                  { service: "Remplacement porte", status: "2–3 jours", ok: false },
                ].map((item) => (
                  <div key={item.service} className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 group">
                    <span className="text-white/70 text-sm group-hover:text-white transition-colors">{item.service}</span>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${item.ok ? "text-emerald-400" : "text-amber-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 bg-brand/10 border border-brand/20 p-3 text-center">
                <p className="text-brand text-[11px] font-bold uppercase tracking-[0.15em]">
                  Devis gratuit · Sans engagement
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5" />
    </section>
  );
}
