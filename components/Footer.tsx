import Link from "next/link";
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
  { href: "/planifier-une-visite", label: "Planifier une visite" },
];

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="text-brand font-extrabold text-lg tracking-tight block mb-4"
          >
            EXPERTS PORTES DE GARAGE
          </Link>
          <p className="text-sm leading-relaxed text-gray-500 mb-4">
            Service local de réparation de portes de garage — Granby &amp; régions.
            Résultats garantis dès la première visite.
          </p>
          <a
            href="tel:4505585788"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-4 py-2 rounded hover:bg-brand-dark transition-colors"
          >
            450-558-5788
          </a>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
            Services
          </h3>
          <ul className="flex flex-col gap-2">
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
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
            Entreprise
          </h3>
          <ul className="flex flex-col gap-2">
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
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
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
