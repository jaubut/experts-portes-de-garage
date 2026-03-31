import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable — Experts Portes de Garage",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-heading text-brand text-7xl mb-4">404</p>
      <h1 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase mb-4">
        Page introuvable
      </h1>
      <p className="text-gray-500 max-w-md mb-10">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Revenez à
        l&apos;accueil ou consultez nos services.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="bg-brand text-white font-bold px-7 py-3 rounded-lg hover:bg-brand-dark transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
        <a
          href="tel:4505585788"
          className="border-2 border-brand text-brand font-bold px-7 py-3 rounded-lg hover:bg-brand hover:text-white transition-colors"
        >
          450-558-5788
        </a>
      </div>
      <div className="mt-12 text-sm text-gray-400">
        Besoin d&apos;aide?{" "}
        <a href="tel:4505585788" className="text-brand font-semibold hover:underline">
          Appelez-nous au 450-558-5788
        </a>
      </div>
    </div>
  );
}
