import Image from "next/image";
import PlanifierButton from "@/components/PlanifierButton";

export default function CTABanner() {
  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-row items-end gap-4">

        {/* Personnage — 40% sur mobile, fixe sur desktop */}
        <div className="w-[40%] md:w-[220px] flex-shrink-0 self-end">
          <Image
            src="/images/personnage_transparent.png"
            alt="Technicien Experts Portes de Garage"
            width={220}
            height={420}
            className="w-full h-[280px] sm:h-[320px] md:h-[360px] object-contain object-bottom block translate-y-10"
          />
        </div>

        {/* Texte — 60% sur mobile, flex-1 sur desktop — min-w-0 empêche le débordement */}
        <div className="w-[60%] md:w-auto md:flex-1 min-w-0 flex flex-col items-start gap-3 py-8 md:py-12">
          <h2 className="font-heading text-lg sm:text-xl md:text-3xl text-brand uppercase leading-tight">
            Vous ne savez pas par où commencer?
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Appelez-nous et laissez nos experts vous guider pour trouver la solution parfaite.
          </p>
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto">
            <a
              href="tel:4505585788"
              className="inline-flex items-center justify-center gap-2 border-2 border-brand text-brand font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm hover:bg-brand hover:text-white transition-colors whitespace-nowrap"
            >
              450-558-5788
            </a>
            <PlanifierButton className="inline-flex items-center justify-center gap-2 bg-brand text-white font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm hover:bg-brand-dark transition-colors whitespace-nowrap">
              Planifier maintenant
            </PlanifierButton>
          </div>
        </div>

      </div>
    </section>
  );
}
