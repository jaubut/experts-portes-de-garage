"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    href: "/admin/leads",
    label: "Leads",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/jobs",
    label: "Jobs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("admin_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.querySelector(".admin-wrapper")?.setAttribute("data-admin-theme", saved);
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin_theme", next);
    document.querySelector(".admin-wrapper")?.setAttribute("data-admin-theme", next);
  }

  function isActive(item: (typeof NAV_ITEMS)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const sunIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  const moonIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  return (
    <>
      {/* Desktop top bar */}
      <nav className="hidden md:block admin-nav-bar border-b shrink-0">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="text-white font-black text-xs">EP</span>
            </div>
            <span className="admin-text-dim text-[11px] font-medium uppercase tracking-[0.2em]">Admin CRM</span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                    active
                      ? "admin-nav-active"
                      : "admin-nav-link"
                  }`}
                >
                  <span className={active ? "text-red-400" : "admin-text-dim"}>{item.icon}</span>
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-red-500 rounded-full" />
                  )}
                </Link>
              );
            })}
            <button
              onClick={toggleTheme}
              className="ml-3 p-2 rounded-lg admin-nav-link transition-all duration-200 hover:scale-110 active:scale-95"
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            >
              {theme === "dark" ? sunIcon : moonIcon}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 admin-nav-bar backdrop-blur-xl border-t z-50 safe-area-bottom">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-200 ${
                  active ? "text-red-400" : "admin-text-dim"
                }`}
              >
                <span className={active ? "scale-110" : ""}>{item.icon}</span>
                <span className={`text-[10px] font-semibold tracking-wide ${active ? "admin-text-primary" : "admin-text-dim"}`}>
                  {item.label}
                </span>
                {active && <span className="w-1 h-1 rounded-full bg-red-500" />}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center py-2.5 gap-1 px-3 admin-text-dim transition-all duration-200 active:scale-95"
          >
            <span>{theme === "dark" ? sunIcon : moonIcon}</span>
            <span className="text-[10px] font-semibold tracking-wide">{theme === "dark" ? "Clair" : "Sombre"}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
