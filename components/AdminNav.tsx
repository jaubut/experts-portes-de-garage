"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Réservations", icon: "📅", exact: true },
  { href: "/admin/leads", label: "Leads", icon: "👤" },
  { href: "/admin/jobs", label: "Jobs", icon: "📋" },
];

export default function AdminNav() {
  const pathname = usePathname();

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* Desktop top bar */}
      <nav className="hidden md:flex items-center justify-between bg-[#1a1a1a] border-b border-white/10 px-6 py-3 shrink-0">
        <p className="text-white/30 text-xs uppercase tracking-widest">Experts Portes de Garage — Admin</p>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item)
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 z-50">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                isActive(item) ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
