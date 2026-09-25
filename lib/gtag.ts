/**
 * Balise Google (Google Ads) et envoi des conversions.
 * Compte Google Ads « Experts Portes de garage » (574-035-8164) — propriétaire de AW-17995346238.
 */
export const GOOGLE_ADS_ID = "AW-17995346238";

/** Propriété Google Analytics 4 (flux Web). Vide = GA4 désactivé, Google Ads seul. */
export const GA4_ID = "G-10NPEDM005";

/** Événement GA4 envoyé avec chaque conversion (à marquer « événement clé » dans GA4). */
const GA4_EVENTS = {
  clic_appel: "clic_appel",
  demande_rappel: "generate_lead",
} as const;

export const CONVERSIONS = {
  /** Clic sur un lien tel: n'importe où sur le site (« Annonce Appel Direct »). */
  clic_appel: "AW-17995346238/6uevCKP2iuocEL7i7IRD",
  /** Formulaire de demande de rappel envoyé avec succès. */
  demande_rappel: "AW-17995346238/oyXVCKWli-ocEL7i7IRD",
} as const;

/**
 * « Appels depuis le site (60 s+) » : Google remplace le numéro affiché par un numéro
 * de transfert pour les visiteurs venus d'une annonce, et compte l'appel s'il dure 60 s+.
 * Le numéro doit être écrit exactement comme PHONE_DISPLAY sur les pages.
 */
export const WEBSITE_CALL = "AW-17995346238/b7ePCMrApYQdEL7i7IRD";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/** Envoie une conversion à Google Ads (et à GA4 si configuré). Silencieux si la balise n'est pas chargée. */
export function gtagConversion(name: keyof typeof CONVERSIONS) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: CONVERSIONS[name], value: 1.0, currency: "CAD" });
  if (GA4_ID) window.gtag("event", GA4_EVENTS[name], { send_to: GA4_ID, value: 1.0, currency: "CAD" });
}
