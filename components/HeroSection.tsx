import Image from "next/image";
import PlanifierButton from "@/components/PlanifierButton";

export default function HeroSection() {
  return (
    <section className="bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-24 flex flex-col-reverse md:flex-row items-center gap-6 md:gap-12">
        <div className="flex-1 max-w-xl text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold text-brand leading-tight mb-4 md:mb-6">
            Experts Portes de Garage – Réparation rapide, service local,
            résultats garantis.
          </h1>
          <p className="text-base md:text-lg text-[#1a1a1a] mb-6 md:mb-8 leading-relaxed">
            Besoin d&apos;une réparation de porte de garage aujourd&apos;hui?
            Nos experts se déplacent rapidement partout en Estrie et
            Montérégie pour régler le problème dès la première visite.
            Service courtois, honnête et garanti — sans tracas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start">
            <PlanifierButton className="hidden md:inline-block bg-brand text-white font-bold px-7 py-3.5 rounded text-center hover:bg-brand-dark transition-colors">
              Planifier maintenant
            </PlanifierButton>
            <a
              href="tel:4505585788"
              className="bg-brand text-white font-bold px-7 py-3.5 rounded text-center hover:bg-brand-dark transition-colors w-full sm:w-auto"
            >
              Appelez maintenant
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center w-full">
          <Image
            src="https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-22-oct.-2025-22_20_39.webp"
            alt="Technicien Experts Portes de Garage"
            width={540}
            height={540}
            className="object-cover w-[70%] md:w-full md:max-w-md"
            priority
          />
        </div>
      </div>
    </section>
  );
}
