import PlanifierButton from "@/components/PlanifierButton";

export default function HeroSection() {
  return (
    <section className="relative bg-[#111111] min-h-[92vh] flex items-center overflow-hidden">

      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
        backgroundSize: "20px 20px",
      }} />

      {/* Red accent block right side */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-brand/10 hidden lg:block" />
      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-brand hidden lg:block" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left">

            <div className="inline-flex items-center gap-2 bg-brand/15 border border-brand/40 text-brand rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              Service disponible 24h/7j — Granby & régions
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white uppercase leading-tight mb-6">
              Votre porte de garage{" "}
              <span className="text-brand">ne répond plus?</span>
            </h1>

            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Nos techniciens se déplacent rapidement partout en Estrie et Montérégie pour régler le problème <strong className="text-white">dès la première visite</strong>. Service garanti.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
              {[
                { icon: "⭐", text: "4.9 / 200+ avis" },
                { icon: "🛡️", text: "Garanti 2 ans" },
                { icon: "⚡", text: "Intervention rapide" },
                { icon: "✅", text: "Devis gratuit" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start">
              <PlanifierButton className="bg-brand text-white font-bold px-8 py-4 rounded-lg text-base hover:bg-brand-dark transition-colors shadow-lg shadow-brand/30 w-full sm:w-auto">
                Planifier maintenant →
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-lg text-base hover:border-white hover:bg-white/10 transition-colors w-full sm:w-auto text-center"
              >
                📞 450-558-5788
              </a>
            </div>
          </div>

          {/* Right side card */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-md">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center text-white text-xl">🏠</div>
                  <div>
                    <p className="text-white font-bold text-sm">Experts Portes de Garage</p>
                    <p className="text-white/50 text-xs">Estrie & Montérégie</p>
                  </div>
                </div>

                <div className="space-y-0">
                  {[
                    { service: "Réparation de ressort", time: "Dès aujourd'hui", color: "text-green-400" },
                    { service: "Remplacement de porte", time: "2-3 jours", color: "text-yellow-400" },
                    { service: "Coupe-froid", time: "Dès aujourd'hui", color: "text-green-400" },
                    { service: "Ouvre-porte", time: "Dès aujourd'hui", color: "text-green-400" },
                  ].map((item) => (
                    <div key={item.service} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <span className="text-white/80 text-sm">{item.service}</span>
                      <span className={`text-xs font-bold ${item.color}`}>{item.time}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-brand/10 border border-brand/30 rounded-lg p-3 text-center">
                  <p className="text-brand text-xs font-bold uppercase tracking-wide">Devis gratuit · Sans engagement</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Disponible maintenant
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
