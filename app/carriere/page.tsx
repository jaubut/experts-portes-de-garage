import type { Metadata } from "next";
import CarrierePageContent from "@/components/CarrierePageContent";

export const metadata: Metadata = {
  title: "Carrière — Experts Portes de Garage",
  description: "Rejoins une équipe d'experts passionnés en Estrie et Montérégie. Formation payée, avancement, culture d'entreprise forte.",
};

export default function CarrierePage() {
  return <CarrierePageContent />;
}
