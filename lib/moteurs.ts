/**
 * Les ouvre-portes que Lambert installe. Il répare la plupart des marques,
 * mais il n'installe que du LiftMaster.
 *
 * Tout ce qui est écrit ici est vérifié : les modèles viennent de ses
 * commandes chez DEK Canada (commande 499895-00 du 21 sept. 2026), les
 * caractéristiques des fiches LiftMaster et Garaga Canada, le prix de
 * Lambert lui-même. N'ajoute rien qu'on ne peut pas prouver.
 *
 * ── LES VIDÉOS ──
 * Pour l'instant, des courts YouTube (verticaux) filmés par d'autres
 * installateurs, en anglais : LiftMaster n'a pas publié de démo courte de
 * ces modèles. À remplacer par les clips de Lambert dès qu'il en filme :
 * dépose le MP4 dans public/videos/ et mets `{ mp4: "/videos/nom.mp4" }`.
 * Liste vide = bloc vidéo masqué dans la fiche.
 */

export type Video = { youtube: string } | { mp4: string };

export type Moteur = {
  modele: string;
  nom: string;
  type: string;
  image: string;
  prix: string;
  resume: string;
  pourQui: string[];
  points: string[];
  videos: Video[];
};

export const MOTEURS: Moteur[] = [
  {
    modele: "2220L",
    nom: "LiftMaster 2220L",
    type: "Moteur central, au plafond",
    image: "/images/moteurs/liftmaster-2220l.webp",
    prix: "995 $ installé",
    resume: "Le moteur classique au centre du plafond, avec une caméra intégrée.",
    pourQui: [
      "La plupart des garages résidentiels",
      "Vous voulez voir votre garage à distance",
      "Usage normal à la maison",
    ],
    points: [
      "Moteur DC à chaîne, doux et silencieux",
      "Caméra intégrée, visible dans l’appli myQ",
      "Wi-Fi et Bluetooth intégrés",
      "Démarrage et arrêt en douceur",
      "Codes de télécommande qui changent à chaque utilisation (Security+ 3.0)",
      "Garantie de 5 ans sur le moteur",
    ],
    videos: [{ youtube: "a4ygvUCJnbo" }, { youtube: "UB0lN12IOU8" }],
  },
  {
    modele: "LJ8900W",
    nom: "LiftMaster LJ8900W",
    type: "Moteur mural, à côté de la porte",
    image: "/images/moteurs/liftmaster-lj8900w.webp",
    prix: "995 $ installé",
    resume: "Il se pose sur le mur, à côté de la porte. Rien au plafond.",
    pourQui: [
      "Plafond haut ou cathédrale",
      "Plafond encombré : rangement, lift, éclairage",
      "Vous voulez garder le plafond libre",
    ],
    points: [
      "Monté sur le mur, directement sur l’arbre des ressorts",
      "Aucun rail ni chaîne au plafond",
      "Wi-Fi intégré, contrôle au cellulaire",
      "Construit pour l’usage commercial léger : robuste pour une maison",
      "Codes de télécommande qui changent à chaque utilisation",
    ],
    videos: [{ youtube: "GGuGiEHZqvs" }],
  },
];
