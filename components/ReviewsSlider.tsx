"use client";

import { useState } from "react";

const reviews = [
  {
    text: "Service incroyable! J'ai appelé Experts Portes de Garage pour un ressort brisé. Le tech est arrivé en moins d'une heure, super professionnel.",
    author: "Martin L.",
  },
  {
    text: "Très bonne expérience. Ma porte gelait tout le temps l'hiver. Lambert est venu, il a ajusté mes rails, changé mon coupe-froid.",
    author: "Sophie B.",
  },
  {
    text: "Professionnel, rapide, efficace! Mon ouvre-porte faisait un drôle de bruit. Ils sont venus le jour même.",
    author: "Jean-François P.",
  },
  {
    text: "Je les recommande sans hésiter. Le travail est propre, le tech est courtois, prix honnête.",
    author: "Marie-Claude R.",
  },
];

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsSlider() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1));

  const review = reviews[index];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      {/* Left: speech bubble */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={prev}
          aria-label="Avis précédent"
          className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-brand text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative flex-1 bg-white border-2 border-brand rounded-2xl px-8 py-10 text-center shadow-sm">
          <span className="absolute -top-4 left-5 text-brand leading-none select-none" style={{ fontSize: "4.5rem", lineHeight: 1 }}>
            &ldquo;
          </span>

          <div className="mb-4">
            <Stars />
          </div>

          <p className="text-gray-700 leading-relaxed text-[0.95rem] mb-6">
            {review.text}
          </p>

          <p className="font-heading text-brand text-lg uppercase">— {review.author}</p>

          <span className="absolute -bottom-8 right-5 text-brand leading-none select-none rotate-180" style={{ fontSize: "4.5rem", lineHeight: 1 }}>
            &ldquo;
          </span>

          <div className="absolute -bottom-[10px] left-10 w-4 h-4 bg-white border-b-2 border-r-2 border-brand rotate-45" />
        </div>

        <button
          onClick={next}
          aria-label="Avis suivant"
          className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-brand text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Right: Google badge */}
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-10 py-8 flex flex-col items-center gap-3 w-full max-w-xs">
          <svg className="w-10 h-10" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M46.145 24.5c0-1.546-.138-3.032-.395-4.455H24v8.42h12.445c-.537 2.9-2.17 5.36-4.627 7.01v5.824h7.49c4.383-4.038 6.837-9.987 6.837-16.8z" />
            <path fill="#34A853" d="M24 47c6.24 0 11.47-2.07 15.293-5.606l-7.49-5.823C29.71 37.24 27.02 38 24 38c-6.014 0-11.104-4.063-12.923-9.528H3.35v6.014C7.154 42.533 15.02 47 24 47z" />
            <path fill="#FBBC05" d="M11.077 28.472A14.48 14.48 0 0110.5 24c0-1.557.267-3.07.577-4.472V13.514H3.35A23.018 23.018 0 001 24c0 3.713.888 7.225 2.35 10.486l7.727-6.014z" />
            <path fill="#EA4335" d="M24 10c3.39 0 6.434 1.165 8.83 3.455l6.617-6.617C35.464 3.14 30.234 1 24 1 15.02 1 7.154 5.467 3.35 13.514l7.727 6.014C12.896 14.063 17.986 10 24 10z" />
          </svg>

          <p className="text-4xl font-extrabold text-[#1a1a1a]">4.8</p>
          <Stars />
          <p className="text-sm text-gray-500">Basé sur nos avis Google</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a
            href="https://www.google.com/search?q=Experts+Portes+de+Garage+Granby"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand text-white font-bold px-6 py-3 rounded-lg text-center hover:bg-brand-dark transition-colors"
          >
            Voir nos avis Google
          </a>
          <a
            href="https://g.page/r/review"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-brand text-brand font-bold px-6 py-3 rounded-lg text-center hover:bg-brand hover:text-white transition-colors"
          >
            Laisser un avis
          </a>
        </div>

        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Avis ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index ? "w-6 h-2.5 bg-brand" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
