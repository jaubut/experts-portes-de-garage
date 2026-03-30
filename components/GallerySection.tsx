"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const photos = [
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_13_30.webp",
    alt: "Porte de garage moderne",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_11_14.webp",
    alt: "Porte de garage résidentielle",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_07_59.webp",
    alt: "Installation de porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-12_54_14.webp",
    alt: "Porte de garage en bois",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_05_59.webp",
    alt: "Porte de garage acier",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_17_56.webp",
    alt: "Porte de garage contemporaine",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_20_12.webp",
    alt: "Porte de garage double",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_21_53.webp",
    alt: "Porte de garage traditionnelle",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_23_47.webp",
    alt: "Porte de garage avec fenêtres",
  },
];

const GAP = 20; // px — matches gap-5

function getVisibleCount(width: number) {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}

export default function GallerySection() {
  const [visibleCount, setVisibleCount] = useState(3);
  const [index, setIndex] = useState(0);

  // Update visibleCount on resize and clamp index
  useEffect(() => {
    const update = () => {
      const count = getVisibleCount(window.innerWidth);
      setVisibleCount(count);
      setIndex((i) => Math.min(i, photos.length - count));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = photos.length - visibleCount;

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));

  // Each slide's width (including its trailing gap) is (100% + GAP) / visibleCount.
  // Translating by `index` steps means: -index * (100% + GAP) / visibleCount
  const translateX = `calc(-${index} * ((100% + ${GAP}px) / ${visibleCount}))`;

  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-brand uppercase text-center mb-4">
          Inspiration!
        </h2>
        <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Parcourez notre galerie pour découvrir l&apos;exceptionnel savoir-faire de
          nos portes de garage, alliant style et fonctionnalité.
        </p>

        <div className="relative">
          {/* Prev arrow */}
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Précédent"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:border-brand transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ gap: `${GAP}px`, transform: `translateX(${translateX})` }}
            >
              {photos.map((photo) => (
                <div
                  key={photo.src}
                  className="flex-shrink-0 overflow-hidden rounded-xl aspect-[4/3]"
                  style={{
                    width: `calc((100% - ${(visibleCount - 1) * GAP}px) / ${visibleCount})`,
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={next}
            disabled={index === maxIndex}
            aria-label="Suivant"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:border-brand transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots — one per valid index position */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Page ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 h-2.5 bg-brand"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
