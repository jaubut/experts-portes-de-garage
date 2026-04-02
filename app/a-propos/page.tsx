import type { Metadata } from "next";
import AProposPageContent from "@/components/AProposPageContent";

export const metadata: Metadata = {
  title: "À Propos — Experts Portes de Garage",
  description: "Une équipe de techniciens qualifiés qui croit en l'innovation et l'apprentissage constant. Service rapide, honnête et moderne à Granby.",
  openGraph: {
    title: "À Propos — Experts Portes de Garage",
    description: "Une équipe de techniciens qualifiés, passionnés et honnêtes. Service professionnel en Estrie et Montérégie.",
    url: "/a-propos",
  },
};

export default function AProposPage() {
  return <AProposPageContent />;
}
