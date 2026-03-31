"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const services = [
  {
    title: "Réparation urgente 24/7",
    description: "Nos experts locaux interviennent rapidement pour résoudre vos problèmes de porte de garage, de jour comme de nuit.",
    href: "/reparation-urgente-de-porte-de-garage",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    title: "Nouvelle installation",
    description: "Modernisez votre maison avec nos services d'installation de portes de garage neuves — toutes marques et styles.",
    href: "/installation-de-nouvelle-porte-de-garage",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    title: "Ouvre-portes de garage",
    description: "Installation, réparation et entretien de vos ouvre-portes électriques. Moteurs performants et marques reconnues.",
    href: "/reparation-ouvre-porte-de-garage",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

function ServiceCard({ s }: { s: (typeof services)[0] }) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-brand/10 transition-colors duration-300 group-hover:bg-brand">
        <span className="text-brand transition-colors duration-300 group-hover:text-white">{s.icon}</span>
      </div>
      <h3 className="font-heading text-lg uppercase mb-2 text-brand">
        {s.title}
      </h3>
      <p className="text-sm leading-relaxed flex-1 mb-5 text-gray-600">
        {s.description}
      </p>
      <Link
        href={s.href}
        className="self-start inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline transition-colors"
      >
        En savoir plus
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

export default function ServicesGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(index, services.length - 1));
    scrollRef.current.scrollTo({
      left: clamped * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(clamped);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const index = Math.round(
      scrollRef.current.scrollLeft / scrollRef.current.clientWidth
    );
    setActiveIndex(index);
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading text-3xl md:text-4xl text-brand text-center uppercase mb-4">
          Nos services
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Peu importe le problème, l&apos;entretien ou l&apos;amélioration
          recherchée — vous êtes au bon endroit.
        </p>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {services.map((s) => (
                <div key={s.href} className="snap-center flex-shrink-0 w-full px-1">
                  <ServiceCard s={s} />
                </div>
              ))}
            </div>

            {activeIndex > 0 && (
              <button
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Précédent"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:border-brand transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {activeIndex < services.length - 1 && (
              <button
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Suivant"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:border-brand transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-5">
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Service ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-6 h-2.5 bg-brand" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <ServiceCard key={s.href} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
