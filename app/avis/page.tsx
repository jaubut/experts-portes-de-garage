import type { Metadata } from "next";
import RedirectionAvis from "@/components/RedirectionAvis";

export const metadata: Metadata = {
  title: "Laisser un avis | Experts Portes de Garage",
  // Page de redirection : elle n'a rien a faire dans les resultats de recherche.
  robots: { index: false, follow: false },
};

export default function PageAvis() {
  return <RedirectionAvis />;
}
