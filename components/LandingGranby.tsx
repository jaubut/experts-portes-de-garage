import Image from "next/image";
import RappelForm from "@/components/RappelForm";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/config";
import { LANDING, prix } from "@/lib/landing-granby";

/* ─── Bris urgents (voie A) ─────────────────────────────────────────────── */
const BRIS_URGENTS = [
  { titre: "Ressort cassé", texte: "Un gros « bang » et la porte ne lève plus. La réparation la plus fréquente." },
  { titre: "Câble sorti ou brisé", texte: "La porte penche d’un côté ou reste croche." },
  { titre: "Porte débarrée du rail", texte: "Elle est sortie de sa track et refuse de bouger." },
  { titre: "Ouvre-porte qui ne répond plus", texte: "Moteur, engrenage, télécommande ou capteurs." },
  { titre: "Roulettes et charnières usées", texte: "Porte bruyante, qui force ou qui accroche." },
  { titre: "Porte qui ne ferme pas complètement", texte: "Souvent les yeux électriques ou l’ajustement." },
];

/* ─── Réparations planifiées (voie B) ───────────────────────────────────── */
const TRAVAUX_PLANIFIES = [
  { titre: "Porte bruyante", texte: "Grincement, cognement, vibration. Presque toujours des roulettes, des charnières ou un manque de lubrification." },
  { titre: "Porte lourde ou qui force", texte: "Le moteur peine, la porte remonte croche. Les ressorts perdent de la tension bien avant de casser." },
  { titre: "Porte qui ferme mal", texte: "Elle laisse passer l’air, la neige ou les souris. Souvent les coupe-froid ou l’ajustement du bas de porte." },
  { titre: "Ouvre-porte capricieux", texte: "Il faut appuyer deux fois, la télécommande a une portée de cinq pieds, le clavier ne répond plus." },
  { titre: "Panneau ou section abîmée", texte: "Un coup de bumper, un panneau bossé. Souvent remplaçable sans changer la porte au complet." },
  { titre: "Isolation et coupe-froid", texte: "Garage froid, courant d’air. Remplacer les joints coûte une fraction d’une porte neuve." },
];

export default function LandingGranby() {
  const aDesPrix =
    LANDING.prixDeplacement !== null ||
    LANDING.prixUrgence.some((l) => l.prix !== null) ||
    LANDING.prixPlanifie.some((l) => l.prix !== null);

  const lienRdv = LANDING.lienRendezVous ?? "#rappel";

  return (
    <div className="pb-20 md:pb-0">
      {/* ── Barre du haut ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-brand text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 text-sm">
          <span className="font-medium">Réparation de porte de garage · Granby</span>
          <a href={PHONE_HREF} className="font-bold tabular-nums hover:underline">
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-40px)] items-center overflow-hidden bg-neutral-900 md:min-h-0 md:py-24">
        {LANDING.photoHero && (
          <Image
            src={LANDING.photoHero}
            alt="Technicien en réparation de porte de garage à Granby"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#5a0000_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,#2a0000_0%,transparent_55%)]"
        />

        <div className="relative mx-auto w-full max-w-3xl px-5 py-10">
          <h1 className="font-heading text-[2.1rem] uppercase leading-[1.05] text-white sm:text-5xl">
            Réparation de porte de garage à Granby
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
            Bris urgent réparé le jour même, ou rendez-vous à votre convenance pour une porte
            qui force, qui est bruyante ou qui ferme mal. Prix donné avant de commencer.
          </p>

          {/* Aiguillage : l’urgence garde le poids visuel */}
          <div className="mt-7 space-y-3">
            <a
              href={PHONE_HREF}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand px-6 py-5 font-heading text-xl uppercase tracking-wide text-white shadow-lg shadow-black/30 transition-transform active:scale-[0.98] sm:text-2xl"
            >
              <PhoneIcon className="h-6 w-6" />
              C’est urgent — {PHONE_DISPLAY}
            </a>

            <a
              href={lienRdv}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <CalendarIcon className="h-5 w-5" />
              Ça peut attendre — prendre rendez-vous
            </a>
          </div>

          <p className="mt-5 text-sm text-white/70">
            {LANDING.heuresReponse && <>Réponse en direct de {LANDING.heuresReponse} · </>}
            Prix dit avant les travaux · Granby et {LANDING.rayonKm} km autour
          </p>
        </div>
      </section>

      {/* ── Réassurance ────────────────────────────────────────────────── */}
      <section className="border-b bg-muted">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 sm:grid-cols-3">
          <Reassurance
            icone="⏱"
            titre="Le jour même"
            texte="Dans la plupart des cas."
          />
          <Reassurance
            icone="💵"
            titre="Prix fixe d’avance"
            texte="Pas de surprise sur la facture."
          />
          <Reassurance
            icone="🔧"
            titre="Pièces dans le camion"
            texte="Ressorts, câbles, roulettes."
          />
        </div>
      </section>

      {/* ── VOIE A : bris urgents ──────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="font-heading text-3xl uppercase sm:text-4xl">Les problèmes que je règle</h2>
        <p className="mt-2 text-gray-600">Touchez votre problème pour m’appeler tout de suite.</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BRIS_URGENTS.map((b) => (
            <a
              key={b.titre}
              href={PHONE_HREF}
              className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand hover:bg-brand/[0.03]"
            >
              <h3 className="font-bold text-gray-900 group-hover:text-brand">{b.titre}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{b.texte}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                <PhoneIcon className="h-4 w-4" /> Appeler
              </span>
            </a>
          ))}
        </div>

        <p className="mt-6 rounded-xl border-l-4 border-brand bg-brand/5 p-4 text-sm leading-relaxed text-gray-800">
          <strong>Sécurité :</strong> un ressort de torsion est sous très forte tension. Si le vôtre
          est cassé, ne forcez pas la porte à la main et n’essayez pas de la lever : appelez-moi.
        </p>
      </section>

      {/* ── VOIE B : travaux planifiés ─────────────────────────────────── */}
      <section className="bg-muted">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="font-heading text-3xl uppercase sm:text-4xl">
            Votre porte fonctionne, mais pas comme avant?
          </h2>
          <p className="mt-2 max-w-2xl text-gray-600">
            Ce sont les affaires qu’on repousse jusqu’à ce que ça casse un matin d’hiver.
            La plupart se règlent en une visite planifiée, à votre horaire.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TRAVAUX_PLANIFIES.map((t) => (
              <div key={t.titre} className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-bold text-gray-900">{t.titre}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{t.texte}</p>
              </div>
            ))}
          </div>

          {/* Encadré entretien : le produit d’appel de la voie B */}
          <div className="mt-8 rounded-2xl border-2 border-brand/20 bg-white p-6 sm:p-8">
            <h3 className="font-heading text-2xl uppercase text-brand">
              Mise au point complète
              {LANDING.miseAuPoint.prix !== null && <> — {prix(LANDING.miseAuPoint.prix)}</>}
            </h3>
            <p className="mt-3 leading-relaxed text-gray-700">
              Je vérifie et j’ajuste la tension des ressorts, je lubrifie, je serre la quincaillerie,
              je teste l’équilibrage et l’inversion de sécurité, et je vous dis ce qui est en train
              de s’user.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700">
              Ça prend environ {LANDING.miseAuPoint.minutes} minutes. C’est ce qui évite le ressort
              qui casse un matin de janvier, et c’est bien moins cher qu’une urgence.
            </p>
            <a
              href={lienRdv}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-bold text-white transition-colors hover:bg-brand-dark"
            >
              <CalendarIcon className="h-5 w-5" /> Réserver une mise au point
            </a>
          </div>
        </div>
      </section>

      {/* ── Prix (masqué tant qu’aucun prix n’est rempli) ──────────────── */}
      {aDesPrix && (
        <section className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="font-heading text-3xl uppercase sm:text-4xl">Combien ça coûte</h2>

          {LANDING.prixDeplacement !== null && (
            <p className="mt-4 rounded-xl bg-muted p-4 text-lg">
              <strong>Déplacement et diagnostic : {prix(LANDING.prixDeplacement)}</strong>
              <span className="text-gray-600"> — crédité sur la réparation si vous allez de l’avant.</span>
            </p>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <TableauPrix titre="Bris urgents" lignes={LANDING.prixUrgence} />
            <TableauPrix titre="Travaux planifiés" lignes={LANDING.prixPlanifie} />
          </div>

          <p className="mt-6 rounded-xl border-l-4 border-brand bg-brand/5 p-4 leading-relaxed text-gray-800">
            Le prix exact est confirmé sur place avant que je touche à quoi que ce soit. Si le prix
            ne fait pas votre affaire, vous ne payez que le déplacement.
          </p>
        </section>
      )}

      {/* ── Comment ça marche ──────────────────────────────────────────── */}
      <section className="bg-muted">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="font-heading text-3xl uppercase sm:text-4xl">Comment ça marche</h2>
          <ol className="mt-7 grid gap-6 sm:grid-cols-3">
            <Etape n={1} titre="Vous appelez">
              Je réponds moi-même. Décrivez-moi le bruit ou ce que vous voyez, je sais
              généralement de quoi il s’agit en deux minutes.
            </Etape>
            <Etape n={2} titre="Je passe">
              Souvent la même journée. Je vérifie sur place et je vous donne le prix ferme
              avant de commencer.
            </Etape>
            <Etape n={3} titre="Je répare">
              La plupart des réparations se règlent en une visite, entre 45 minutes et 2 heures.
            </Etape>
          </ol>
        </div>
      </section>

      {/* ── Qui vient chez vous ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
          {LANDING.photoLambert ? (
            <Image
              src={LANDING.photoLambert}
              alt="Lambert Hétu, Experts Portes de Garage"
              width={220}
              height={220}
              className="mx-auto rounded-2xl object-cover"
            />
          ) : (
            <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-4 text-center text-xs text-gray-400 md:h-[220px] md:w-[220px]">
              Votre photo ici
            </div>
          )}

          <div>
            <h2 className="font-heading text-3xl uppercase sm:text-4xl">Moi, Lambert Hétu</h2>
            <p className="mt-4 leading-relaxed text-gray-700">
              C’est moi qui réponds au téléphone et c’est moi qui me présente chez vous. Pas de
              répartiteur, pas de sous-traitant, pas de vendeur qui essaie de vous refiler une
              porte neuve.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700">
              Je suis de Granby. Je vous explique ce qui est brisé, je vous montre la pièce, et je
              vous dis honnêtement ce qui peut attendre et ce qui ne peut pas.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Entreprise enregistrée au Québec — NEQ {LANDING.neq}.
            </p>
          </div>
        </div>
      </section>

      {/* ── Zone desservie ─────────────────────────────────────────────── */}
      <section className="bg-muted">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-heading text-2xl uppercase sm:text-3xl">Zone desservie</h2>
          <p className="mt-3 leading-relaxed text-gray-700">{LANDING.villes.join(", ")}.</p>
          <p className="mt-3 text-gray-600">
            Pas certain si vous êtes dans la zone?{" "}
            <a href={PHONE_HREF} className="font-semibold text-brand underline underline-offset-2">
              Appelez, je vais vous le dire tout de suite.
            </a>
          </p>
        </div>
      </section>

      {/* ── Avis (masqué tant qu’il n’y a pas de vrais avis) ───────────── */}
      {LANDING.avis.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="font-heading text-3xl uppercase sm:text-4xl">Ce que le monde en dit</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {LANDING.avis.slice(0, 3).map((a, i) => (
              <blockquote key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="leading-relaxed text-gray-700">« {a.texte} »</p>
                <footer className="mt-3 text-sm font-semibold text-gray-500">
                  {a.prenom}, {a.ville}
                </footer>
              </blockquote>
            ))}
          </div>
          {LANDING.lienAvisGoogle && (
            <a
              href={LANDING.lienAvisGoogle}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm font-semibold text-brand underline underline-offset-2"
            >
              Voir tous les avis sur Google
            </a>
          )}
        </section>
      )}

      {/* ── FAQ (accordéon natif, aucun JavaScript) ────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 py-14">
        <h2 className="font-heading text-3xl uppercase sm:text-4xl">Questions fréquentes</h2>
        <div className="mt-7 divide-y divide-gray-200 border-y border-gray-200">
          {LANDING.faq.soirEtFinDeSemaine && (
            <Question q="Vous venez le soir ou la fin de semaine?">
              {LANDING.faq.soirEtFinDeSemaine}
            </Question>
          )}
          <Question q="Combien de temps pour la réparation?">
            La plupart des ressorts et des câbles se font en une visite, entre 45 minutes et 2 heures.
          </Question>
          {LANDING.faq.garantie && (
            <Question q="Est-ce que la réparation est garantie?">{LANDING.faq.garantie}</Question>
          )}
          {LANDING.faq.paiements && (
            <Question q="Quels paiements acceptez-vous?">{LANDING.faq.paiements}</Question>
          )}
          <Question q="Ma porte a 20 ans, est-ce que ça vaut la peine de la réparer?">
            Souvent oui. Un ressort ou des câbles coûtent une fraction d’une porte neuve. Je vous le
            dis franchement sur place si ce n’est pas rentable.
          </Question>
          <Question q="Ma porte est bruyante mais elle fonctionne. Ça peut attendre?">
            Généralement oui, mais le bruit est un signe d’usure. Des roulettes ou des charnières
            usées finissent par tirer sur les câbles et les ressorts. Une visite planifiée
            maintenant coûte pas mal moins cher qu’une urgence en janvier.
          </Question>
          {LANDING.lienRendezVous && (
            <Question q="Est-ce que je peux réserver en ligne sans appeler?">
              Oui. Choisissez votre plage horaire directement, vous recevez la confirmation par courriel.
            </Question>
          )}
        </div>
      </section>

      {/* ── Formulaire (plan B) ────────────────────────────────────────── */}
      <section id="rappel" className="scroll-mt-14 bg-muted">
        <div className="mx-auto max-w-xl px-5 py-14">
          <h2 className="font-heading text-3xl uppercase sm:text-4xl">Écrivez-moi</h2>
          <p className="mt-2 mb-6 text-gray-600">
            Je vous rappelle. Trois champs, ça prend 20 secondes.
          </p>
          <RappelForm />
        </div>
      </section>

      {/* ── Pied de page légal ─────────────────────────────────────────── */}
      <footer className="bg-neutral-900 py-8 text-center text-sm text-white/60">
        <p className="font-semibold text-white/80">Experts Portes de Garage</p>
        <p className="mt-1">Granby, Québec · NEQ {LANDING.neq}</p>
        <p className="mt-1">
          <a href={PHONE_HREF} className="hover:text-white">{PHONE_DISPLAY}</a>
        </p>
      </footer>

      {/* ── Barre d’appel collée en bas (mobile) ───────────────────────── */}
      <a
        href={PHONE_HREF}
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 bg-brand py-4 font-heading text-lg uppercase tracking-wide text-white shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:hidden"
      >
        <PhoneIcon className="h-5 w-5" />
        Appeler maintenant — {PHONE_DISPLAY}
      </a>
    </div>
  );
}

/* ─── Petits composants ─────────────────────────────────────────────────── */

function Reassurance({ icone, titre, texte }: { icone: string; titre: string; texte: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl leading-none">{icone}</span>
      <div>
        <p className="font-bold text-gray-900">{titre}</p>
        <p className="text-sm text-gray-600">{texte}</p>
      </div>
    </div>
  );
}

function TableauPrix({
  titre,
  lignes,
}: {
  titre: string;
  lignes: readonly { travail: string; prix: number | null }[];
}) {
  const visibles = lignes.filter((l) => l.prix !== null);
  if (visibles.length === 0) return null;
  return (
    <div>
      <h3 className="font-heading text-xl uppercase text-gray-900">{titre}</h3>
      <dl className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
        {visibles.map((l) => (
          <div key={l.travail} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-gray-700">{l.travail}</dt>
            <dd className="shrink-0 font-bold tabular-nums text-gray-900">
              à partir de {prix(l.prix as number)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Etape({ n, titre, children }: { n: number; titre: string; children: React.ReactNode }) {
  return (
    <li className="rounded-2xl bg-white p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-heading text-lg text-white">
        {n}
      </span>
      <h3 className="mt-4 font-bold text-gray-900">{titre}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{children}</p>
    </li>
  );
}

function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
        {q}
        <span className="shrink-0 text-brand transition-transform group-open:rotate-45">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </summary>
      <p className="mt-3 leading-relaxed text-gray-600">{children}</p>
    </details>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
