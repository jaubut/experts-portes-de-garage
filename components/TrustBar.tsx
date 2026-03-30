import Link from "next/link";

const trustPoints = [
  "Service à la clientèle supérieur",
  "Techniciens hautement qualifiés",
  "Service d'urgence 24/7",
  "Pièces et marques de qualité",
];

export default function TrustBar() {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand mb-8">
            Votre partenaire local de confiance
          </h2>
          <ul className="flex flex-col gap-4">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[#1a1a1a] font-semibold">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-gray-600 leading-relaxed mb-6">
            Avec plusieurs années d&apos;expérience dans la région de Granby
            et des environs, notre équipe met l&apos;accent sur la qualité,
            la transparence et la sécurité à chaque intervention.
          </p>
          <Link
            href="/a-propos"
            className="inline-block bg-brand text-white font-bold px-6 py-3 rounded hover:bg-brand-dark transition-colors"
          >
            En savoir plus sur nous
          </Link>
        </div>
      </div>
    </section>
  );
}
