"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/** Enregistre les clics sur les liens tel: et mailto: partout sur le site. */
export default function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        track("clic_appel", { page: window.location.pathname });
      } else if (href.startsWith("mailto:")) {
        track("clic_courriel", { page: window.location.pathname });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
