/**
 * Balise Google (Google Ads) et envoi des conversions.
 * Compte Google Ads « Experts Portes de garage » (806-724-3086).
 */
export const GOOGLE_ADS_ID = "AW-17995346238";

export const CONVERSIONS = {
  /** Clic sur un lien tel: n'importe où sur le site (« Annonce Appel Direct »). */
  clic_appel: "AW-17995346238/6uevCKP2iuocEL7i7IRD",
  /** Formulaire de demande de rappel envoyé avec succès. */
  demande_rappel: "AW-17995346238/oyXVCKWli-ocEL7i7IRD",
} as const;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/** Envoie une conversion à Google Ads. Silencieux si la balise n'est pas chargée. */
export function gtagConversion(name: keyof typeof CONVERSIONS) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: CONVERSIONS[name], value: 1.0, currency: "CAD" });
}
