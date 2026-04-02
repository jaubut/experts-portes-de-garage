import type { Metadata } from "next";
import AProposPageContent from "@/components/AProposPageContent";

export const metadata: Metadata = {
  title: "À Propos — Experts Portes de Garage",
  description: "Une équipe de techniciens qualifiés qui croit en l'innovation et l'apprentissage constant. Service rapide, honnête et moderne à Granby.",
};

export default function AProposPage() {
  return <AProposPageContent />;
}
