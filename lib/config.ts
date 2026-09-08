export const BUSINESS_NAME = "Experts Portes de Garage";
export const PHONE_DISPLAY = "438-808-9604";
export const PHONE_HREF = "tel:4388089604";
export const EMAIL = "info@expertsportesdegarage.ca";
export const SERVICE_AREA = "Estrie et Montérégie";
export const CITY = "Granby";

/**
 * Lien du formulaire d'avis Google, pris dans la fiche Google Business
 * (bouton « Demander des avis »). Il ressemble a https://g.page/r/XXXX/review
 *
 * C'est la seule ligne a changer si la fiche change un jour : le code QR
 * des cartes d'affaires pointe sur /avis, pas directement sur Google.
 * Tant que cette valeur est vide, /avis affiche le numero de telephone
 * au lieu de rediriger dans le vide.
 */
export const GOOGLE_REVIEW_URL = "https://g.page/r/CT-AI6_v4mdPEBM/review";
