import PlanifierButton from "@/components/PlanifierButton";

export default function InspectionBanner() {
  return (
    <section className="bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-heading text-white text-xl md:text-2xl uppercase tracking-wide mb-1">
            Inspection complète pour seulement{" "}
            <span className="text-brand">39,95$</span>
          </p>
          <p className="text-gray-400 text-sm">
            Diagnostic professionnel de votre porte de garage par un technicien certifié.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <PlanifierButton className="bg-brand text-white font-bold px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm whitespace-nowrap shadow-sm">
            Planifier une inspection
          </PlanifierButton>
          <a
            href="tel:4505585788"
            className="border-2 border-white text-white font-bold px-6 py-3 rounded-lg hover:bg-white hover:text-[#1a1a1a] transition-colors text-sm whitespace-nowrap text-center"
          >
            450-558-5788
          </a>
        </div>
      </div>
    </section>
  );
}
