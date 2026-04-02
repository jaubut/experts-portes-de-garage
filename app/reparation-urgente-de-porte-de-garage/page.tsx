import type { Metadata } from "next";
import UrgentPageContent from "@/components/UrgentPageContent";

export const metadata: Metadata = {
  title: "Réparation Urgente de Porte de Garage — Experts Portes de Garage",
  description: "Service d'urgence 24/7 pour votre porte de garage en Estrie et Montérégie. Intervention le jour même. Appelez le 450-558-5788.",
};

export default function ReparationUrgenteDePorteDeGaragePage() {
  return <UrgentPageContent />;
}
