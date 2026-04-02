import type { Metadata } from "next";
import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";

export const metadata: Metadata = {
  title: "À Propos — Experts Portes de Garage",
  description: "Vos experts en portes de garage depuis 2010. Plus de 3 000 clients servis à Granby et dans un rayon de 45 km.",
};

const services = [
  "Réparation de portes de garage (toutes marques)",
  "Installation de portes de garage neuves",
  "Entretien et maintenance",
  "Service d'urgence 24/7",
];

const reasons = [
  { icon: "🏆", text: "14 ans d'expérience" },
  { icon: "👥", text: "Plus de 3 000 clients satisfaits" },
  { icon: "⚡", text: "Service rapide et professionnel" },
  { icon: "🛡️", text: "Garantie sur tous les travaux" },
  { icon: "🤝", text: "Équipe courtoise et qualifiée" },
  { icon: "💰", text: "Tarifs justes et transparents" },
];

const values = [
  { title: "Fiabilité", desc: "On arrive quand on dit qu'on arrive. Votre temps est précieux." },
  { title: "Honnêteté", desc: "Pas de frais cachés. Le prix annoncé est le prix payé." },
  { title: "Qualité", desc: "On utilise du bon matériel pour que la réparation dure." },
  { title: "Service", desc: "Le client est notre priorité. On est là pour vous, pas l'inverse." },
];

const testimonials = [
  { text: "Super service! Ils ont réparé ma porte en 2 heures. Je recommande sans hésiter.", name: "Marie D.", city: "Granby" },
  { text: "Enfin une entreprise honnête! Prix juste et excellent travail. Pas de surprises.", name: "Jean L.", city: "Roxton Pond" },
  { text: "Disponibles 24/7, c'est parfait pour nous! Intervenus un dimanche soir sans problème.", name: "Sophie M.", city: "Granby" },
];

const certifications = [
  "Entreprise assurée",
  "Équipe certifiée en sécurité",
  "Licences valides",
];

export default function AProposPage() {
  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="bg-[#1a1a1a] py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <nav className="text-sm text-white/50 mb-6 flex items-center gap-2 justify-center">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/70">À propos</span>
          </nav>
          <h1 className="font-heading text-4xl md:text-5xl text-white uppercase leading-tight mb-4">
            À Propos de <span className="text-brand">Nous</span>
          </h1>
          <p className="text-white/70 text-lg">Vos experts en portes de garage depuis 2010</p>
        </div>
      </section>

      {/* ── 2. STATS ── */}
      <section className="bg-brand py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "2010", label: "En business depuis" },
              { num: "14", label: "Ans d'expérience" },
              { num: "3 000+", label: "Clients servis" },
              { num: "45 km", label: "Rayon de service" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-heading text-3xl md:text-4xl text-white uppercase">{s.num}</p>
                <p className="text-white/70 text-xs mt-1 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. NOTRE HISTOIRE ── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Notre histoire</p>
          <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-8 leading-tight">
            Qui sommes-nous?
          </h2>
          <div className="space-y-5 text-gray-600 text-base leading-relaxed">
            <p>
              Depuis <strong className="text-[#1a1a1a]">2010</strong>, nous avons aidé plus de <strong className="text-[#1a1a1a]">3 000 clients</strong> à Granby et dans la région. Ce qui a commencé comme une petite équipe de 2 personnes est devenu une entreprise de confiance reconnue dans toute l&apos;Estrie et la Montérégie.
            </p>
            <p>
              Nous croyons que chaque client mérite un service <strong className="text-[#1a1a1a]">rapide, fiable et honnête</strong>. Pas de surprises, pas de frais cachés — seulement du bon travail bien fait.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. CE QU'ON FAIT ── */}
      <section className="bg-[#f5f5f5] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Nos services</p>
          <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Ce qu&apos;on fait
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[#1a1a1a] font-semibold text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. POURQUOI NOUS CHOISIR ── */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Nos avantages</p>
          <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Pourquoi nous choisir
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reasons.map((r) => (
              <div key={r.text} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
                <span className="text-2xl">{r.icon}</span>
                <span className="text-[#1a1a1a] font-semibold text-sm">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. NOS VALEURS ── */}
      <section className="bg-[#1a1a1a] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Ce en quoi on croit</p>
          <h2 className="font-heading text-2xl md:text-3xl text-white uppercase text-center mb-10 leading-tight">
            Nos valeurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
                <p className="font-heading text-brand text-lg uppercase mb-2">{v.title}</p>
                <p className="text-white/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CERTIFICATIONS ── */}
      <section className="bg-[#f5f5f5] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2">Certifications & assurances</p>
          <h2 className="font-heading text-2xl text-[#1a1a1a] uppercase mb-8">Vous êtes entre bonnes mains</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((c) => (
              <div key={c} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm">
                <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[#1a1a1a] font-semibold text-sm">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. TÉMOIGNAGES ── */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2 text-center">Ce qu&apos;ils disent</p>
          <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase text-center mb-10 leading-tight">
            Témoignages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-bold text-[#1a1a1a] text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CONTACT ── */}
      <section className="bg-brand py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl md:text-3xl text-white uppercase mb-3 leading-tight">
            Vous avez des questions?
          </h2>
          <p className="text-white/80 mb-8">Appelez-nous, on est là pour vous aider!</p>
          <a
            href="tel:4505585788"
            className="block font-heading text-4xl md:text-5xl text-white uppercase mb-6 hover:text-white/80 transition-colors"
          >
            450-558-5788
          </a>
          <PlanifierButton className="inline-flex items-center gap-2 bg-white text-brand font-bold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors shadow-lg">
            Prendre rendez-vous →
          </PlanifierButton>
        </div>
      </section>
    </>
  );
}
