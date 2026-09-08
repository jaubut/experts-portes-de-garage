"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GOOGLE_REVIEW_URL, PHONE_DISPLAY, PHONE_HREF } from "@/lib/config";

/**
 * Page de redirection vers le formulaire d'avis Google.
 *
 * Pourquoi une vraie page plutot qu'une redirection 308 :
 * elle est comptee comme une visite dans Vercel Analytics, ce qui donne
 * le nombre de scans du code QR des cartes d'affaires. Une redirection
 * serveur ne laisserait aucune trace.
 *
 * Le lien de destination vit dans lib/config.ts (GOOGLE_REVIEW_URL) :
 * si la fiche Google change un jour, on modifie cette constante au lieu
 * de reimprimer les cartes.
 */
export default function RedirectionAvis() {
  const [tropLong, setTropLong] = useState(false);
  const configuree = GOOGLE_REVIEW_URL.length > 0;

  useEffect(() => {
    if (!configuree) return;
    // Court delai : laisse la visite se rendre a Vercel Analytics avant de quitter.
    const depart = setTimeout(() => window.location.replace(GOOGLE_REVIEW_URL), 700);
    // Si la redirection ne part pas (JS bloque, navigateur restrictif), on montre le lien.
    const secours = setTimeout(() => setTropLong(true), 2500);
    return () => {
      clearTimeout(depart);
      clearTimeout(secours);
    };
  }, [configuree]);

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6 py-16 text-center">
      <Image
        src="/images/logo_experts.png"
        alt="Experts Portes de Garage"
        width={220}
        height={220}
        priority
        className="w-40 h-auto mb-8 rounded-xl bg-white p-3"
      />

      {configuree ? (
        <>
          <h1 className="font-heading text-3xl md:text-4xl uppercase text-white leading-tight">
            Merci beaucoup
          </h1>
          <p className="mt-4 max-w-sm text-gray-300 leading-relaxed">
            On vous amène sur Google pour laisser votre avis. Ça prend 30 secondes et ça aide
            énormément un travailleur autonome.
          </p>

          <div className="mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-1/3 animate-[glisse_1.1s_ease-in-out_infinite] rounded-full bg-brand" />
          </div>

          <a
            href={GOOGLE_REVIEW_URL}
            className={`mt-8 rounded-full bg-brand px-7 py-3.5 font-heading text-base uppercase tracking-wide text-white shadow-lg shadow-brand/30 transition-opacity ${
              tropLong ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            Continuer vers Google
          </a>

          <style>{`@keyframes glisse { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
        </>
      ) : (
        <>
          <h1 className="font-heading text-3xl md:text-4xl uppercase text-white leading-tight">
            Merci beaucoup
          </h1>
          <p className="mt-4 max-w-sm text-gray-300 leading-relaxed">
            La page d’avis n’est pas encore branchée. En attendant, vous pouvez me joindre
            directement, ça me fait toujours plaisir.
          </p>
          <a
            href={PHONE_HREF}
            className="mt-8 rounded-full bg-brand px-7 py-3.5 font-heading text-xl uppercase tracking-wide text-white shadow-lg shadow-brand/30"
          >
            {PHONE_DISPLAY}
          </a>
        </>
      )}
    </main>
  );
}
