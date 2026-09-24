"use client";

import { useEffect, useState } from "react";
import { MOTEURS, type Moteur } from "@/lib/moteurs";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/config";

/**
 * Les ouvre-portes LiftMaster que Lambert installe, en cartes cliquables.
 * Chaque carte ouvre une fiche : pour qui, caractéristiques, prix, et la
 * vidéo du moteur en action quand elle existe (voir lib/moteurs.ts).
 */
export default function MotorSection() {
  const [ouvert, setOuvert] = useState<Moteur | null>(null);

  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(null);
    window.addEventListener("keydown", fermer);
    return () => window.removeEventListener("keydown", fermer);
  }, [ouvert]);

  return (
    <>
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="font-heading text-3xl uppercase sm:text-4xl">
          Si on le remplace : les moteurs que j’installe
        </h2>
        <p className="mt-2 max-w-2xl text-gray-600">
          Je répare la plupart des marques, mais j’installe seulement du LiftMaster. Je connais
          ces moteurs à fond, et leurs pièces se trouvent chez mon fournisseur au Québec.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {MOTEURS.map((m) => (
            <button
              key={m.modele}
              type="button"
              onClick={() => setOuvert(m)}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-colors hover:border-brand"
            >
              <div className="flex h-52 items-center justify-center bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.image} alt={m.nom} className="max-h-44 max-w-full object-contain" />
              </div>
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-sm font-semibold text-gray-500">{m.type}</p>
                <h3 className="font-heading text-xl uppercase text-gray-900 group-hover:text-brand">
                  {m.nom}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{m.resume}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-heading text-xl text-brand">{m.prix}</span>
                  <span className="text-sm font-semibold text-brand group-hover:underline">
                    Voir la fiche
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {ouvert && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
          onClick={() => setOuvert(null)}
          role="dialog"
          aria-modal="true"
          aria-label={ouvert.nom}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOuvert(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              aria-label="Fermer"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex h-56 items-center justify-center bg-white px-8 pt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ouvert.image} alt={ouvert.nom} className="max-h-48 max-w-full object-contain" />
            </div>

            <div className="px-6 pb-6 pt-5">
              <p className="text-sm font-semibold text-gray-500">{ouvert.type}</p>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-heading text-2xl uppercase text-gray-900">{ouvert.nom}</h3>
                <span className="whitespace-nowrap font-heading text-xl text-brand">{ouvert.prix}</span>
              </div>

              <h4 className="mt-6 text-sm font-bold uppercase tracking-wide text-gray-900">Idéal pour</h4>
              <ul className="mt-2 space-y-1.5">
                {ouvert.pourQui.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {p}
                  </li>
                ))}
              </ul>

              <h4 className="mt-6 text-sm font-bold uppercase tracking-wide text-gray-900">Ce qu’il a</h4>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {ouvert.points.map((p) => (
                  <div key={p} className="rounded-lg bg-muted px-3 py-2 text-sm text-gray-700">
                    {p}
                  </div>
                ))}
              </div>

              {ouvert.videos.length > 0 && (
                <>
                  <h4 className="mt-6 text-sm font-bold uppercase tracking-wide text-gray-900">
                    Le voir en marche
                  </h4>
                  <div className="mt-2 flex snap-x gap-3 overflow-x-auto pb-1">
                    {ouvert.videos.map((v) => (
                      <div
                        key={"youtube" in v ? v.youtube : v.mp4}
                        className="aspect-[9/16] w-[200px] shrink-0 snap-start overflow-hidden rounded-xl bg-black"
                      >
                        {"youtube" in v ? (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${v.youtube}?rel=0&modestbranding=1&playsinline=1`}
                            title={`${ouvert.nom} en marche`}
                            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            loading="lazy"
                            className="h-full w-full"
                          />
                        ) : (
                          <video src={v.mp4} controls playsInline preload="metadata" className="h-full w-full" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Vidéos d’installateurs aux États-Unis, en anglais.
                  </p>
                </>
              )}

              <p className="mt-6 text-sm leading-relaxed text-gray-600">
                Le prix comprend le moteur et l’installation. Je vous confirme tout sur place avant
                de commencer.
              </p>

              <a
                href={PHONE_HREF}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3.5 font-bold text-white transition-colors hover:bg-brand-dark"
              >
                Appeler pour l’installer : {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
