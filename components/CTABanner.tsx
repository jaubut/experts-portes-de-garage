import Image from "next/image";
import PlanifierButton from "@/components/PlanifierButton";

export default function CTABanner() {
  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-row items-end gap-6">
        {/* Technician image */}
        <div className="flex-shrink-0 flex justify-center self-end">
          <Image
            src="/images/personnage_transparent.png"
            alt="Technicien Experts Portes de Garage"
            width={200}
            height={340}
            className="object-contain object-bottom h-[260px] w-auto md:h-[300px] block"
          />
        </div>

        {/* Text column */}
        <div className="flex-1 flex flex-col items-start gap-4 py-8 md:py-12">
          <h2 className="font-heading text-xl md:text-3xl text-brand uppercase leading-tight">
            Vous ne savez pas par où commencer?
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg">
            Appelez-nous dès maintenant et laissez nos experts sympathiques vous
            guider afin de trouver la solution parfaite pour votre porte de garage.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <a
              href="tel:4505585788"
              className="inline-flex items-center gap-2 border-2 border-brand text-brand font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-brand hover:text-white transition-colors"
            >
              Appelez 450-558-5788
            </a>
            <PlanifierButton className="inline-flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-brand-dark transition-colors">
              Planifier maintenant
            </PlanifierButton>
          </div>
        </div>
      </div>
    </section>
  );
}
