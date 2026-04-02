import type { Metadata } from "next";
import CarrierePageContent from "@/components/CarrierePageContent";

export const metadata: Metadata = {
  title: "Carrière — Experts Portes de Garage",
  description: "Rejoins une équipe d'experts passionnés en Estrie et Montérégie. Formation payée, avancement, culture d'entreprise forte.",
  openGraph: {
    title: "Travaille avec nous — Experts Portes de Garage",
    description: "Rejoins une équipe passionnée en Estrie et Montérégie. Formation payée, camion fourni, opportunités d'avancement.",
    url: "/carriere",
  },
};

export default function CarrierePage() {
  return <CarrierePageContent />;
}
