import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";
import CopyrightYear from "@/components/CopyrightYear";

const serviceLinks = [
  { href: "/reparation-urgente-de-porte-de-garage", label: "Réparation urgente 24/7" },
  { href: "/installation-de-nouvelle-porte-de-garage", label: "Nouvelle installation" },
  { href: "/reparation-ouvre-porte-de-garage", label: "Ouvre-porte de garage" },
  { href: "/remplacement-de-ressort-de-porte-de-garage", label: "Remplacement de ressorts" },
  { href: "/entretien-de-porte-de-garage", label: "Entretien de portes" },
  { href: "/coupe-froid-de-porte-de-garage", label: "Coupe-froid et joints" },
  { href: "/services-de-porte-de-garage", label: "Tous les services →" },
];

const companyLinks = [
  { href: "/a-propos", label: "À propos" },
  { href: "/carriere", label: "Carrières" },
];

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400">
      {/* Pre-footer CTA strip */}
      <div className="bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-heading text-white text-lg md:text-xl uppercase tracking-wide text-center sm:text-left">
            Besoin d&apos;un expert maintenant?
          </p>
          <div className="flex items-center gap-3">
            <a
              href="tel:4505585788"
              className="bg-white text-brand font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              450-558-5788
            </a>
            <PlanifierButton className="border-2 border-white text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-white hover:text-brand transition-colors">
              Planifier une visite
            </PlanifierButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="font-heading text-brand text-xl tracking-tight block mb-4 uppercase"
          >
            Experts Portes de Garage
          </Link>
          <p className="text-sm leading-relaxed text-gray-500 mb-5">
            Service local de réparation de portes de garage — Granby &amp; régions.
            Résultats garantis dès la première visite.
          </p>
          <a
            href="tel:4505585788"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors"
          >
            450-558-5788
          </a>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-heading text-white text-sm uppercase tracking-widest mb-5">
            Services
          </h3>
          <ul className="flex flex-col gap-2.5">
            {serviceLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Entreprise */}
        <div>
          <h3 className="font-heading text-white text-sm uppercase tracking-widest mb-5">
            Entreprise
          </h3>
          <ul className="flex flex-col gap-2.5">
            {companyLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-heading text-white text-sm uppercase tracking-widest mb-5">
            Contact
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a
                href="tel:4505585788"
                className="text-gray-400 hover:text-white transition-colors"
              >
                450-558-5788
              </a>
            </li>
            <li>
              <a
                href="mailto:info@expertsportesdegarage.ca"
                className="text-gray-400 hover:text-white transition-colors break-all"
              >
                info@expertsportesdegarage.ca
              </a>
            </li>
            <li className="text-gray-500">Granby &amp; régions, Québec</li>
            <li className="text-gray-500 text-xs mt-1">
              Service d&apos;urgence disponible<br />7 jours sur 7, 24h/24
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-gray-600">
        © <CopyrightYear /> Experts Portes de Garage. Tous droits réservés.
      </div>
    </footer>
  );
}
