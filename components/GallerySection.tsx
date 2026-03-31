"use client";

import { useRef, useState } from "react";

const GALLERY_PHOTOS = [
  { src: "/images/gallery-1.webp", alt: "Remplacement de ressort de porte de garage" },
  { src: "/images/gallery-2.webp", alt: "Remplacement de câbles de porte de garage" },
  { src: "/images/gallery-3.webp", alt: "Remplacement de roulettes de porte de garage" },
  { src: "/images/gallery-4.webp", alt: "Remplacement de panneau de porte de garage" },
  { src: "/images/gallery-5.webp", alt: "Installation de porte de garage résidentielle" },
  { src: "/images/gallery-6.webp", alt: "Réparation de rails de porte de garage" },
  { src: "/images/gallery-7.webp", alt: "Remplacement de tambour de porte de garage" },
  { src: "/images/gallery-8.webp", alt: "Installation d'ouvre-porte de garage" },
  { src: "/images/gallery-9.webp", alt: "Installation de coupe-froid de porte de garage" },
];

export default function GallerySection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    setScrollPos(scrollRef.current.scrollLeft);
  };

  const canScrollLeft = scrollPos > 10;
  const canScrollRight = scrollRef.current
    ? scrollPos < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
    : true;

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading text-2xl md:text-3xl text-brand text-center uppercase mb-3">
          Galerie — Nos réalisations
        </h2>
        <p className="text-gray-500 text-center text-sm mb-10">
          Découvrez l&apos;exceptionnel savoir-faire de nos techniciens.
        </p>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {GALLERY_PHOTOS.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={photo.src}
              alt={photo.alt}
              className="w-full h-56 object-cover rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {GALLERY_PHOTOS.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={photo.src}
                alt={photo.alt}
                className="snap-center flex-shrink-0 w-[80%] h-48 object-cover rounded-xl shadow-sm"
              />
            ))}
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Défiler gauche"
              className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-brand"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Défiler droite"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-brand"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
