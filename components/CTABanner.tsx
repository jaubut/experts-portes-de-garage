import Image from "next/image";
import PlanifierButton from "@/components/PlanifierButton";

export default function CTABanner() {
  return (
    <section className="bg-white pt-10 md:pt-14 pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-end gap-8 md:gap-12">
        {/* Technician image — bleeds to bottom edge */}
        <div className="w-full md:w-[40%] flex justify-center self-end">
          <Image
            src="https://expertsportesdegarage.ca/wp-content/uploads/2025/11/ChatGPT-Image-15-nov.-2025-10_02_00.webp"
            alt="Technicien Experts Portes de Garage"
            width={340}
            height={380}
            className="object-contain object-bottom h-[320px] w-auto block"
          />
        </div>

        {/* Text column */}
        <div className="w-full md:w-[60%] flex flex-col items-start gap-4 pb-10 md:pb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand uppercase leading-tight">
            Vous ne savez pas par où commencer?
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Appelez-nous dès maintenant et laissez nos experts sympathiques vous
            guider afin de trouver la solution parfaite pour votre réparation de
            portes de garage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:4505585788"
              className="inline-flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-lg text-sm whitespace-nowrap hover:bg-brand-dark transition-colors"
            >
              Appelez maintenant → 450-558-5788
            </a>
            <PlanifierButton className="inline-flex items-center gap-2 border-2 border-brand text-brand font-bold px-5 py-2.5 rounded-lg text-sm whitespace-nowrap hover:bg-brand hover:text-white transition-colors">
              Planifier maintenant
            </PlanifierButton>
          </div>
        </div>
      </div>
    </section>
  );
}
