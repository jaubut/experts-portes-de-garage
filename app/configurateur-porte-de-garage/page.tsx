import type { Metadata } from "next";
import GarageConfigurator from "@/components/GarageConfigurator";

export const metadata: Metadata = {
  title: "Configurateur de porte Garex — Experts Portes de Garage",
  description:
    "Concevez votre porte de garage Garex en temps réel. Choisissez le style, la couleur, l'isolation et les fenêtres, et obtenez une soumission personnalisée.",
};

export default function ConfigurateurPage() {
  return <GarageConfigurator />;
}
