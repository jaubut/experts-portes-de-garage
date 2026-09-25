import type { Metadata } from "next";
import UrgentPageContent from "@/components/UrgentPageContent";

export const metadata: Metadata = {
  title: "Réparation Urgente de Porte de Garage — Experts Portes de Garage",
  description: "Service d'urgence 24/7 pour votre porte de garage en Estrie et Montérégie. Intervention le jour même. Appelez le 438-808-9604.",
  alternates: { canonical: "/reparation-urgente-de-porte-de-garage" },
  openGraph: {
    title: "Réparation Urgente de Porte de Garage — 24/7",
    description: "Service d'urgence 24/7 pour votre porte de garage. Intervention le jour même en Estrie et Montérégie.",
    url: "/reparation-urgente-de-porte-de-garage",
  },
};

export default function ReparationUrgenteDePorteDeGaragePage() {
  return <UrgentPageContent />;
}
