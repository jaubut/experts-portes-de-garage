import type { Metadata } from "next";
import type { FaqItem } from "@/lib/content";
import Image from "next/image";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import WeatherSealPlanifierButton from "@/components/WeatherSealPlanifierButton";
import SealTypeSelector from "@/components/SealTypeSelector";
import AnimatedTestimonials from "@/components/AnimatedTestimonials";
import AnimatedPainPoints from "@/components/AnimatedPainPoints";
import AnimatedSteps from "@/components/AnimatedSteps";
import { WeatherSealBookingProvider } from "@/context/WeatherSealBookingContext";

const HERO_BG =
  "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-16_30_47-1024x683.webp";
const LOGO_SRC =
  "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-14_03_41.webp";

export const metadata: Metadata = {
  title: "Remplacement de coupe-froid de porte de garage — Experts Portes de Garage",
  description:
    "Votre coupe-froid est usé, craquelé ou décollé? Nos techniciens remplacent rapidement les joints d'étanchéité pour protéger votre garage du froid, de l'humidité et des infiltrations — Estrie et Montérégie.",
};



const faqItems: FaqItem[] = [
  {
    q: "Combien de temps dure le remplacement d'un coupe-froid?",
    a: "La plupart des remplacements sont complétés en 30 à 60 minutes. Si plusieurs types de joints doivent être remplacés en même temps, comptez 1 à 2 heures.",
  },
  {
    q: "Comment savoir si mon coupe-froid doit être remplacé ou simplement ajusté?",
    a: "Si le joint est craquelé, durci ou décollé, le remplacement est nécessaire. Si la porte est simplement mal alignée, un ajustement peut suffire. Nos techniciens évaluent la situation sur place et vous recommandent la meilleure solution.",
  },
  {
    q: "Est-ce que vous intervenez en urgence pour un coupe-froid?",
    a: "Oui, nous pouvons intervenir rapidement si votre garage est exposé au froid ou à l'eau en raison d'un joint défectueux.",
  },
  {
    q: "Quelle est la durée de vie d'un coupe-froid de qualité professionnelle?",
    a: "Un joint EPDM ou vinyle renforcé installé correctement peut durer de 8 à 15 ans, contre 2 à 4 ans pour un joint générique vendu en quincaillerie.",
  },
  {
    q: "Desservez-vous toute la région de Granby et l'Estrie?",
    a: "Oui, nous intervenons dans toute la région de Granby, Bromont, Waterloo, Cowansville, Magog, Sherbrooke et les environs en Estrie et Montérégie.",
  },
];

export default function RemplacementCoupeFroidPage() {
  return (
    <WeatherSealBookingProvider>
    <>
      {/* ── 1. HERO ── */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 md:pt-20 pb-12">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">

            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <nav className="text-sm text-white/60 mb-5 flex items-center gap-2 justify-center lg:justify-start">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <span>/</span>
                <span className="text-white/80">Coupe-froid de porte de garage</span>
              </nav>
              <h1 className="font-heading text-3xl md:text-5xl text-white uppercase leading-tight mb-5">
                Remplacement de coupe-froid de porte de garage en Estrie
              </h1>
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Votre joint est usé, craquelé ou décollé? Nos techniciens remplacent rapidement tous les types de coupe-froids pour protéger votre garage du froid, de l'eau et des nuisibles.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <WeatherSealPlanifierButton className="bg-brand text-white font-bold px-7 py-3.5 rounded-lg hover:bg-brand-dark transition-colors text-base shadow-lg">
                  Planifier mon remplacement
                </WeatherSealPlanifierButton>
                <a
                  href="tel:4505585788"
                  className="border-2 border-white text-white font-bold px-7 py-3.5 rounded-lg hover:bg-white hover:text-[#1a1a1a] transition-colors text-base text-center"
                >
                  450-558-5788
                </a>
              </div>
            </div>

            {/* Right — booking card */}
            <div className="w-full lg:min-w-[400px] lg:w-[400px] shrink-0">
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-brand px-5 py-4 flex items-center justify-between gap-3">
                  <Image src={LOGO_SRC} alt="Experts Portes de Garage" width={160} height={52}
                    className="h-10 w-auto object-contain brightness-0 invert shrink-0" />
                  <span className="font-heading text-white text-sm text-right leading-tight uppercase">
                    Réservez votre service
                  </span>
                </div>
                <div className="bg-brand-dark px-5 py-2">
                  <p className="text-white/90 text-xs text-center font-medium">
                    Remplacement de coupe-froid — Rapide, propre et garanti.
                  </p>
                </div>
                <div className="px-5 pt-5 pb-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-800 text-xs font-semibold">Inspection + lubrification OFFERTES (valeur 75$)</p>
                  </div>
                  <p className="text-gray-600 text-sm leading-snug">
                    Choisissez le moment qui vous convient et nos techniciens se déplacent chez vous.
                  </p>
                  <WeatherSealPlanifierButton className="w-full bg-brand text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                    Planifier mon remplacement
                  </WeatherSealPlanifierButton>
                  <a href="tel:4505585788"
                    className="w-full border-2 border-brand text-brand font-bold py-3 px-4 rounded-lg hover:bg-brand hover:text-white transition-colors text-sm text-center">
                    Appeler le 450-558-5788
                  </a>
                  <p className="text-gray-400 text-xs text-center">Sans engagement · Réponse rapide</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. PAIN POINTS ── */}
      <AnimatedPainPoints />

      {/* ── 3. WHAT'S INCLUDED / SEAL TYPES ── */}
      <SealTypeSelector />

      {/* ── 4. EXCLUSIVE OFFER ── */}
      <section className="bg-brand py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-3">Offre exclusive</p>
          <h2 className="font-heading text-3xl md:text-4xl text-white uppercase mb-4 leading-tight">
            Inspection complète + lubrification GRATUITES
          </h2>
          <p className="text-white/80 text-lg mb-2">
            Valeur de <span className="font-bold text-white line-through">75$</span>{" "}
            <span className="font-bold text-white bg-white/20 rounded px-2 py-0.5">INCLUSES</span> avec tout remplacement de coupe-froid
          </p>
          <p className="text-white/70 text-sm mb-10 max-w-lg mx-auto">
            Nos techniciens profitent de leur passage pour vérifier l'ensemble de votre porte et lubrifier les pièces mobiles — sans frais supplémentaires.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WeatherSealPlanifierButton className="bg-white text-brand font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-base shadow-lg">
              Profiter de l'offre maintenant
            </WeatherSealPlanifierButton>
            <a href="tel:4505585788"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-brand transition-colors text-base text-center">
              450-558-5788
            </a>
          </div>
        </div>
      </section>

      {/* ── 5. PROCESS STEPS ── */}
      <AnimatedSteps />

      {/* ── 6. TESTIMONIALS ── */}
      <AnimatedTestimonials />

      {/* ── 7. SERVICE DETAILS BAND ── */}
      <section className="bg-[#1a1a1a] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <p className="font-heading text-white uppercase text-sm">Zone de service</p>
              <p className="text-gray-400 text-xs">Granby, Bromont, Waterloo, Cowansville, Magog, Sherbrooke et environs</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="font-heading text-white uppercase text-sm">Travail garanti</p>
              <p className="text-gray-400 text-xs">Matériaux EPDM et vinyle renforcé — durée de vie de 8 à 15 ans</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="font-heading text-white uppercase text-sm">Intervention rapide</p>
              <p className="text-gray-400 text-xs">Disponibles 7 jours sur 7 — Réponse le jour même dans la plupart des cas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ── */}
      <section className="bg-muted py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl text-brand text-center uppercase mb-10">
            Foire aux questions
          </h2>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

    </>
    </WeatherSealBookingProvider>
  );
}
