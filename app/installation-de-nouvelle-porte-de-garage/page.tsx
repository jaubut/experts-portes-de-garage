import type { Metadata } from "next";
import InstallationPageContent from "@/components/InstallationPageContent";

export const metadata: Metadata = {
  title: "Installation de Nouvelle Porte de Garage — Experts Portes de Garage",
  description:
    "Installation professionnelle de portes de garage en Estrie et Montérégie. Devis gratuit, sans obligation. Sectionnelles, basculantes, enroulables. Appelez le 438-808-9604.",
  openGraph: {
    title: "Installation de Nouvelle Porte de Garage",
    description:
      "Modernisez votre garage avec une nouvelle porte. Sécurité, économies d'énergie, confort. Devis gratuit sans obligation.",
    url: "/installation-de-nouvelle-porte-de-garage",
  },
};

export default function InstallationDeNouvellePorteDeGaragePage() {
  return <InstallationPageContent />;
}
