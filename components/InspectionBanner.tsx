import PlanifierButton from "@/components/PlanifierButton";

export default function InspectionBanner() {
  return (
    <section className="bg-[#1a1a1a] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8 font-medium">Nos promotions</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Carte 1 — Inspection complète */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-snug mb-1">Inspection complète</p>
              <p className="text-gray-400 text-sm leading-relaxed">Diagnostic professionnel de votre porte par un technicien spécialisé.</p>
            </div>
            <p className="text-brand font-heading text-2xl uppercase">À partir de 39,95$</p>
            <PlanifierButton className="mt-auto bg-brand text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-brand-dark transition-colors text-center">
              Planifier une inspection →
            </PlanifierButton>
          </div>

          {/* Carte 2 — Inspection + lubrification gratuite (mise en valeur) */}
          <div className="bg-brand/10 border-2 border-brand rounded-2xl p-6 flex flex-col gap-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-brand text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                Offre incluse
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-snug mb-1">Inspection + lubrification <span className="text-brand">gratuite</span></p>
              <p className="text-gray-400 text-sm leading-relaxed">Offerte avec tout remplacement de coupe-froid. Profitez-en pour un garage mieux isolé.</p>
            </div>
            <p className="text-brand font-heading text-2xl uppercase">Incluse</p>
            <a
              href="/remplacement-coupe-froid-porte-de-garage"
              className="mt-auto bg-brand text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-brand-dark transition-colors text-center"
            >
              Voir l&apos;offre coupe-froid →
            </a>
          </div>

          {/* Carte 3 — Inspection et lubrification */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-snug mb-1">Inspection et lubrification</p>
              <p className="text-gray-400 text-sm leading-relaxed">Inspection complète + lubrification de tous les mécanismes pour prolonger la durée de vie de votre porte.</p>
            </div>
            <p className="text-brand font-heading text-2xl uppercase">À partir de 70$</p>
            <PlanifierButton className="mt-auto bg-white/10 border border-white/20 text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-white/20 transition-colors text-center">
              Planifier →
            </PlanifierButton>
          </div>

        </div>
      </div>
    </section>
  );
}
