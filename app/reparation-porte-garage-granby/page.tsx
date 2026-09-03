import type { Metadata } from "next";
import LandingGranby from "@/components/LandingGranby";
import { PHONE_DISPLAY, BUSINESS_NAME, EMAIL } from "@/lib/config";
import { LANDING } from "@/lib/landing-granby";

const URL_PAGE = "/reparation-porte-garage-granby";
const TITRE = "Réparation de porte de garage à Granby | Ressort cassé, porte bloquée";
const DESCRIPTION =
  `Réparation de porte de garage à Granby et 30 km autour. Ressort cassé, câble brisé, ` +
  `porte bloquée : réparé le jour même. Prix donné avant les travaux. ${PHONE_DISPLAY}.`;

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: URL_PAGE },
  openGraph: {
    title: "Réparation de porte de garage à Granby",
    description: DESCRIPTION,
    url: URL_PAGE,
    type: "website",
  },
};

/** Fiche d’entreprise locale pour Google. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: BUSINESS_NAME,
  description: DESCRIPTION,
  telephone: PHONE_DISPLAY,
  email: EMAIL,
  url: `https://www.expertsportesdegarage.ca${URL_PAGE}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Granby",
    addressRegion: "QC",
    addressCountry: "CA",
  },
  areaServed: LANDING.villes.map((ville) => ({
    "@type": "City",
    name: ville,
  })),
  knowsAbout: [
    "Réparation de ressort de porte de garage",
    "Remplacement de câble de porte de garage",
    "Réparation d’ouvre-porte de garage",
    "Entretien de porte de garage",
  ],
};

export default function PageGranby() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingGranby />
    </>
  );
}
