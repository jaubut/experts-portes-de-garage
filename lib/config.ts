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

/**
 * Lien court officiel de la fiche Google Business, sans le `/review`.
 *
 * Il sert dans `sameAs` des donnees structurees : c'est ce qui dit aux
 * moteurs et aux IA que ce site et cette fiche Google sont la meme
 * entreprise. Avant, `sameAs` pointait vers une page de RECHERCHE Google,
 * ce qui ne reliait rien du tout.
 */
export const GOOGLE_PROFILE_URL = "https://g.page/r/CT-AI6_v4mdPEBM";

/** Numero d'entreprise du Quebec, registre public du REQ. */
export const NEQ = "2281545188";

/** Le proprietaire. C'est lui qui se deplace, jamais une equipe. */
export const OWNER_NAME = "Lambert Hétu";
