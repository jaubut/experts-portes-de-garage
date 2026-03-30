"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useBookingModal } from "@/context/BookingModalContext";

const serviceLinks = [
  { href: "/reparation-urgente-de-porte-de-garage", label: "Réparation urgente 24/7" },
  { href: "/installation-de-nouvelle-porte-de-garage", label: "Nouvelle installation" },
  { href: "/reparation-ouvre-porte-de-garage", label: "Ouvre-porte de garage" },
  { href: "/remplacement-de-ressort-de-porte-de-garage", label: "Remplacement de ressorts" },
  { href: "/coupe-froid-de-porte-de-garage", label: "Coupe-froid et joints" },
  { href: "/entretien-de-porte-de-garage", label: "Entretien de portes" },
  { href: "/porte-de-garage-endommagee", label: "Porte endommagée" },
  { href: "/remplacement-de-cables-de-porte-de-garage", label: "Remplacement de câbles" },
  { href: "/remplacement-de-panneau-de-porte-de-garage", label: "Remplacement de panneaux" },
  { href: "/remplacement-de-roulettes-de-porte-de-garage", label: "Remplacement de roulettes" },
  { href: "/remplacement-de-tambour-de-porte-de-garage", label: "Remplacement de tambour" },
  { href: "/reparation-de-rails-de-porte-de-garage", label: "Réparation de rails" },
];

const mainNavLinks = [
  { href: "/a-propos", label: "À propos" },
  { href: "/carriere", label: "Carrières" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const isServiceActive = serviceLinks.some((s) => s.href === pathname) || pathname === "/services-de-porte-de-garage";
  const { openModal } = useBookingModal();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-14_03_41.webp"
            alt="Experts Portes de Garage"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {/* Services dropdown */}
          <div className="relative group">
            <button
              className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
                isServiceActive ? "text-brand" : "text-gray-700 hover:text-brand"
              }`}
            >
              Services
              <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown panel */}
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
              <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-4 w-72">
                <div className="grid grid-cols-1 gap-1 mb-3">
                  {serviceLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                        pathname === href
                          ? "bg-brand/10 text-brand font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-brand"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <Link
                    href="/services-de-porte-de-garage"
                    className="text-sm font-bold text-brand flex items-center gap-1 px-3 hover:underline"
                  >
                    Voir tous les services
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main nav links */}
          {mainNavLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-semibold transition-colors ${
                pathname === href ? "text-brand" : "text-gray-700 hover:text-brand"
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Planifier CTA */}
          <button
            type="button"
            onClick={openModal}
            className="text-sm font-bold bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark transition-colors"
          >
            Planifier une visite
          </button>
        </nav>

        {/* Phone + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href="tel:4505585788"
            className="inline-flex lg:hidden items-center bg-brand text-white text-sm font-bold px-4 py-2 rounded hover:bg-brand-dark transition-colors"
          >
            450-558-5788
          </a>
          <button
            className="lg:hidden p-2 text-brand"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">
          {/* Services section */}
          <button
            onClick={() => setMobileServicesOpen((o) => !o)}
            className="flex items-center justify-between w-full text-gray-700 font-semibold text-sm py-2 px-2 rounded-lg hover:bg-gray-50"
          >
            <span className={isServiceActive ? "text-brand" : ""}>Services</span>
            <svg
              className={`w-4 h-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileServicesOpen && (
            <div className="pl-3 flex flex-col gap-1 mb-1">
              {serviceLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    pathname === href ? "text-brand font-semibold bg-brand/10" : "text-gray-600 hover:text-brand"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/services-de-porte-de-garage"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold text-brand py-1.5 px-3 hover:underline"
              >
                Voir tous les services →
              </Link>
            </div>
          )}

          {mainNavLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-semibold py-2 px-2 rounded-lg transition-colors ${
                pathname === href ? "text-brand bg-brand/10" : "text-gray-700 hover:text-brand hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setMobileOpen(false); openModal(); }}
              className="bg-brand text-white text-sm font-bold px-5 py-2.5 rounded text-center hover:bg-brand-dark"
            >
              Planifier une visite
            </button>
            <a
              href="tel:4505585788"
              className="border-2 border-brand text-brand text-sm font-bold px-5 py-2.5 rounded text-center hover:bg-brand hover:text-white transition-colors"
            >
              450-558-5788
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
