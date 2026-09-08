"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GOOGLE_REVIEW_URL, PHONE_DISPLAY, PHONE_HREF } from "@/lib/config";

/**
 * Page d'atterrissage du code QR des cartes d'affaires.
 *
 * Pourquoi une vraie page plutot qu'une redirection 308 :
 * elle compte comme une visite dans Vercel Analytics, ce qui donne le
 * nombre de scans. Une redirection serveur ne laisse aucune trace.
 *
 * Le fond rouge reprend celui du verso de la carte : la personne qui
 * vient de scanner reconnait tout de suite qu'elle est au bon endroit.
 *
 * La destination vit dans lib/config.ts (GOOGLE_REVIEW_URL) : si la fiche
 * Google change, on modifie cette constante au lieu de reimprimer les cartes.
 * Tant qu'elle est vide, la page remercie et affiche le numero de telephone
 * plutot que de rediriger dans le vide.
 */
export default function RedirectionAvis() {
  const [secours, setSecours] = useState(false);
  const branchee = GOOGLE_REVIEW_URL.length > 0;

  useEffect(() => {
    if (!branchee) return;
    // Court delai : laisse la visite se rendre a Vercel Analytics avant de quitter.
    // replace() plutot que href : le bouton Retour ne ramene pas dans la redirection.
    const depart = setTimeout(() => window.location.replace(GOOGLE_REVIEW_URL), 900);
    // Si la redirection ne part pas (JS bloque, navigateur restrictif), on montre le bouton.
    const filet = setTimeout(() => setSecours(true), 2600);
    return () => {
      clearTimeout(depart);
      clearTimeout(filet);
    };
  }, [branchee]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand px-6 py-16 text-center">
      {/* Halo discret, pour que le rouge plein ne soit pas completement plat */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_60%)]"
      />

      <div className="relative flex w-full max-w-md flex-col items-center">
        <div className="rounded-2xl bg-white px-7 py-5 shadow-lg shadow-black/20">
          <Image
            src="/images/logo-experts-detoure.png"
            alt="Experts Portes de Garage"
            width={448}
            height={152}
            priority
            className="h-auto w-44"
          />
        </div>

        <h1 className="mt-9 font-heading text-4xl uppercase leading-none text-white md:text-5xl">
          Merci beaucoup
        </h1>

        {branchee ? (
          <>
            <p className="mt-4 text-[17px] leading-relaxed text-white/90">
              On vous amène sur Google pour laisser votre avis. Ça prend 30 secondes
              et ça aide énormément un travailleur autonome.
            </p>

            <div
              className="mt-9 h-1.5 w-44 overflow-hidden rounded-full bg-white/25"
              role="status"
              aria-label="Redirection vers Google en cours"
            >
              <div className="h-full w-1/3 rounded-full bg-white animate-[glisse_1.1s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:w-full" />
            </div>

            <a
              href={GOOGLE_REVIEW_URL}
              className={`mt-9 rounded-full bg-white px-8 py-4 font-heading text-lg uppercase tracking-wide text-brand shadow-lg shadow-black/20 transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                secours ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              Continuer vers Google
            </a>

            <style>{`@keyframes glisse { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
          </>
        ) : (
          <>
            <p className="mt-4 text-[17px] leading-relaxed text-white/90">
              Content que votre porte fonctionne. La page d’avis n’est pas encore
              branchée, mais vous pouvez me joindre directement n’importe quand.
            </p>

            <a
              href={PHONE_HREF}
              className="mt-9 rounded-full bg-white px-8 py-4 font-heading text-2xl uppercase tracking-wide text-brand shadow-lg shadow-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {PHONE_DISPLAY}
            </a>
          </>
        )}

        <p className="mt-12 text-xs uppercase tracking-[0.18em] text-white/70">
          Lambert Hétu · Granby et les environs
        </p>
      </div>
    </main>
  );
}
