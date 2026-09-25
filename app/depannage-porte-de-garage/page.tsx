import type { Metadata } from "next";
import DepannagePage from "@/components/DepannagePage";

/**
 * Version B du test A/B Google Ads (contrôle = /reparation-urgente-de-porte-de-garage).
 * Seul le trafic d'annonces arrive ici : hors index, canonical vers la page A.
 */
export const metadata: Metadata = {
  title: "Porte de garage brisée? Lambert répare — Experts Portes de Garage",
  description: "Réparation de porte de garage à Granby et dans les environs. Prix affichés. Si je ne peux pas réparer, vous ne payez rien.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/reparation-urgente-de-porte-de-garage" },
};

export default function Page() {
  return <DepannagePage />;
}
