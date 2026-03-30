import { getAllPageSlugs, getPageBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PlanifierButton from "@/components/PlanifierButton";

const HERO_BG =
  "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-16_30_47-1024x683.webp";
const LOGO_SRC =
  "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-14_03_41.webp";

export async function generateStaticParams() {
  return getAllPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getPageBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} — Experts Portes de Garage`,
    description: page.excerpt,
  };
}

export default async function SlugPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = getPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      {/* ── HERO + URGENCY BAR (share the background image) ── */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      >
        <div className="absolute inset-0 bg-black/65" />

        {/* Main two-column content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 md:pt-20 pb-10">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">

            {/* Left — title + excerpt */}
            <div className="flex-1 text-center lg:text-left">
              <nav className="text-sm text-white/60 mb-5 flex items-center gap-2 justify-center lg:justify-start">
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
                <span>/</span>
                <span className="text-white/80">{page.title}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase leading-tight mb-5">
                {page.title}
              </h1>
              {page.excerpt && (
                <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {page.excerpt}
                </p>
              )}
            </div>

            {/* Right — booking card */}
            <div className="w-full lg:min-w-[420px] lg:w-[420px] shrink-0">
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                {/* Red header */}
                <div className="bg-brand px-5 py-4 flex items-center justify-between gap-3">
                  <Image
                    src={LOGO_SRC}
                    alt="Experts Portes de Garage"
                    width={180}
                    height={60}
                    className="h-12 w-auto object-contain brightness-0 invert shrink-0"
                  />
                  <span className="text-white font-bold text-sm text-right leading-tight">
                    Réservez votre service
                  </span>
                </div>
                {/* Dark-red sub-bar */}
                <div className="bg-[#aa0000] px-5 py-2.5">
                  <p className="text-white/95 text-sm text-center font-medium">
                    Service rapide de porte de garage – Réparation ou remplacement.
                  </p>
                </div>
                {/* White body */}
                <div className="px-6 py-6">
                  <p className="text-gray-600 leading-relaxed text-sm mb-6">
                    Faites-nous savoir ce dont vous avez besoin, choisissez le
                    moment qui vous convient le mieux, et nous serons sur place.
                    C&apos;est aussi simple que ça!
                  </p>
                  <PlanifierButton className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                    Planifier une réparation
                  </PlanifierButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Urgency bar — inside hero, sits on top of background image */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-white border-l-4 border-brand rounded-xl shadow-xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-extrabold text-brand text-base leading-snug">
                Urgence ? Obtenez une réparation rapide 24h/24 par nos experts certifiés dès maintenant!
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Nos techniciens qualifiés sont disponibles en tout temps
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <PlanifierButton className="bg-brand text-white font-bold px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm whitespace-nowrap">
                📅 Planifier une inspection
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-brand text-brand font-bold px-5 py-2.5 rounded-lg hover:bg-brand hover:text-white transition-colors text-sm whitespace-nowrap text-center"
              >
                📞 Appeler maintenant → 450-558-5788
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Intro */}
          <p className="text-center leading-[1.85] text-gray-700 max-w-[900px] mx-auto mb-4 text-[1.02rem]">
            Votre porte de garage est brisée et vous avez besoin d&apos;aide immédiatement ? Experts Portes de Garage offre un service de <strong className="font-bold text-[#1a1a1a]">réparation urgente de porte de garage</strong> 24 heures sur 24, 7 jours sur 7, pour tout type de porte de garage. Nous mettons l&apos;accent sur la sécurité, la fiabilité et la formation professionnelle afin de prévenir les blessures et les bris soudains. Nos techniciens certifiés se déplacent rapidement pour régler des problèmes tels que ressorts cassés, câbles effilochés, ouvre-portes défectueux ou rails désalignés — avec un service rapide, professionnel et garanti le jour même.
          </p>

          {/* ── Section: Réparation 24h/24 ── */}
          <h2 className="text-2xl font-bold text-brand uppercase text-center mt-14 mb-6 pt-8 border-t-2 border-brand/30">
            Réparation de porte de garage 24 h/24 avec techniciens locaux experts
          </h2>
          <p className="text-center leading-[1.85] text-gray-700 max-w-[900px] mx-auto mb-4 text-[1.02rem]">
            Si vous avez besoin d&apos;une réparation urgente de porte de garage, Experts Portes de Garage offre un service 24h/24 et 7j/7 sans frais supplémentaires, même les jours fériés. Nos techniciens certifiés interviennent rapidement pour vous éviter des risques et remettre votre système en état en toute sécurité. Pour une assistance immédiate, appelez le{" "}
            <a href="tel:4505585788" className="text-brand font-semibold hover:underline">450-558-5788</a>.
          </p>

          {/* ── Section: Appelez maintenant ── */}
          <h2 className="text-2xl font-bold text-brand uppercase text-center mt-14 mb-6 pt-8 border-t-2 border-brand/30">
            Appelez pour une assistance immédiate près de chez vous
          </h2>
          <p className="text-center leading-[1.85] text-gray-700 max-w-[900px] mx-auto mb-4 text-[1.02rem]">
            Votre porte de garage fait des siennes? <strong className="font-bold text-[#1a1a1a]">Experts Portes de Garage</strong> assure un service d&apos;urgence rapide, 24 heures sur 24 et 7 jours sur 7 — sans frais supplémentaires, même les jours fériés. Nos techniciens certifiés interviennent le jour même pour tout type de problème : ressorts brisés, câbles endommagés, ouvre-porte défectueux, rails désalignés ou porte bloquée.
          </p>
          <p className="text-center leading-[1.85] text-gray-700 max-w-[900px] mx-auto mb-4 text-[1.02rem]">
            Forte de plusieurs années d&apos;expérience, notre équipe met l&apos;accent sur la qualité, la transparence et la sécurité à chaque intervention. Avec des pièces haut de gamme et des pratiques éprouvées, nous rétablissons rapidement le bon fonctionnement de votre porte — et votre tranquillité d&apos;esprit.
          </p>
          <p className="text-center leading-[1.85] text-gray-700 max-w-[900px] mx-auto mb-4 text-[1.02rem]">
            <strong className="font-bold text-[#1a1a1a]">Besoin d&apos;assistance immédiate?</strong>{" "}
            Appelez le{" "}
            <a href="tel:4505585788" className="text-brand font-semibold hover:underline">450-558-5788</a>{" "}
            pour une intervention rapide et professionnelle, effectuée le jour même.
          </p>

          {/* ── Section: Quand appeler ── */}
          <h2 className="text-2xl font-bold text-brand uppercase text-center mt-14 mb-6 pt-8 border-t-2 border-brand/30">
            Quand appeler pour une réparation urgente de porte de garage
          </h2>
          <p className="text-center leading-[1.85] text-gray-700 max-w-[900px] mx-auto mb-4 text-[1.02rem]">
            Si votre porte de garage est coincée ouverte ou fermée, vous devriez appeler un technicien. Mais avant, vous pouvez tenter quelques vérifications simples : assurez-vous que le moteur est bien branché, vérifiez que les piles de la télécommande sont récentes, assurez-vous que les capteurs photoélectriques ne sont pas obstrués, puis essayez de lubrifier légèrement les pièces mobiles. Si malgré tout le problème persiste, appelez le{" "}
            <a href="tel:4505585788" className="text-brand font-semibold hover:underline">450-558-5788</a>{" "}
            en tout temps. Nous sommes ouverts 24/7/365 pour toute réparation urgente de porte de garage.
          </p>

          {/* ── Section: Signes intro ── */}
          <h2 className="text-2xl font-bold text-brand uppercase text-center mt-14 mb-6 pt-8 border-t-2 border-brand/30">
            Signes que vous avez besoin d&apos;une réparation urgente de porte de garage
          </h2>
          <p className="text-center leading-[1.85] text-gray-700 max-w-[900px] mx-auto mb-10 text-[1.02rem]">
            Votre porte de garage est coincée, fait des bruits étranges ou refuse d&apos;ouvrir ou de fermer ? Les pannes arrivent presque toujours au pire moment — vous laissant bloqué à l&apos;extérieur ou compromettant la sécurité de votre maison. Voici quelques-unes des raisons les plus fréquentes nécessitant une réparation urgente :
          </p>

          {/* ── Two-col: Ressorts ── */}
          <div className="flex flex-col md:flex-row gap-8 items-center max-w-5xl mx-auto py-8 border-t border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-22-oct.-2025-22_20_39.webp"
              alt="Ressort de torsion brisé — réparation urgente de porte de garage"
              className="w-full md:w-1/2 rounded-xl shadow-md object-cover"
            />
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-brand uppercase mb-4">
                Votre porte de garage ne s&apos;ouvre plus ou ne se ferme plus ?
              </h2>
              <p className="leading-[1.85] text-gray-700 mb-4 text-[1.02rem]">
                Plusieurs causes peuvent expliquer ce problème. L&apos;une des plus fréquentes est une défaillance de la roue d&apos;entraînement principale du moteur, souvent causée par une porte déséquilibrée, une chaîne ou une courroie trop tendue, une utilisation fréquente ou simplement l&apos;usure avec le temps.
              </p>
              <p className="leading-[1.85] text-gray-700 mb-4 text-[1.02rem]">
                D&apos;autres raisons possibles incluent des capteurs mal alignés, un problème électrique ou un moteur défectueux. Avant d&apos;appeler un technicien, assurez-vous que l&apos;ouvre-porte est bien branché et que les capteurs de sécurité ne sont pas obstrués.
              </p>
              <p className="leading-[1.85] text-gray-700 text-[1.02rem]">
                Si le problème persiste, appelez le{" "}
                <a href="tel:4505585788" className="text-brand font-semibold hover:underline">450-558-5788</a>{" "}
                — une inspection professionnelle est fortement recommandée.
              </p>
            </div>
          </div>

          {/* ── Two-col: Câbles / coincée ── */}
          <div className="flex flex-col md:flex-row gap-8 items-center max-w-5xl mx-auto py-8 border-t border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-16_30_47-1024x683.webp"
              alt="Câbles de porte de garage défectueux — porte coincée ou bloquée"
              className="w-full md:w-1/2 rounded-xl shadow-md object-cover"
            />
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-brand uppercase mb-4">
                Votre porte de garage est coincée ou bloquée
              </h2>
              <p className="leading-[1.85] text-gray-700 mb-4 text-[1.02rem]">
                Une porte de garage fonctionne grâce à plusieurs composantes qui doivent être parfaitement synchronisées. Lorsqu&apos;elle se bloque ou se coince, une réparation urgente devient souvent nécessaire. Les causes les plus fréquentes :
              </p>
              <ul className="flex flex-col gap-3 mb-4 text-gray-700">
                {[
                  "Câbles de porte de garage défectueux ou brisés",
                  "Système de poulies usé ou endommagé",
                  "Rails tordus, obstrués ou désalignés",
                  "Ressorts de porte de garage cassés",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="leading-[1.85] text-gray-700 text-[1.02rem]">
                Évitez de forcer l&apos;ouverture ou la fermeture — cela pourrait aggraver les dommages. Appelez le{" "}
                <a href="tel:4505585788" className="text-brand font-semibold hover:underline">450-558-5788</a>.
              </p>
            </div>
          </div>

          {/* ── Two-col: Bruits / tambours ── */}
          <div className="flex flex-col md:flex-row gap-8 items-center max-w-5xl mx-auto py-8 border-t border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-14_03_41.webp"
              alt="Tambours de porte de garage usés causant des bruits"
              className="w-full md:w-1/2 rounded-xl shadow-md object-cover"
            />
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-brand uppercase mb-4">
                Le type de bruit peut révéler la cause du problème
              </h2>
              <p className="leading-[1.85] text-gray-700 mb-4 text-[1.02rem]">
                Votre porte de garage fait des bruits inhabituels ? Le son peut vous indiquer directement la source du problème :
              </p>
              <ul className="flex flex-col gap-3 mb-4 text-gray-700">
                {[
                  "Claquements (popping) – Souvent causés par des roulettes usées ou détériorées.",
                  "Grincements (squeaking) – Indiquent généralement un manque de lubrification des rails ou des roulettes.",
                  "Frottements ou grattements (scraping/grinding) – Peuvent être dus à un câble effiloché, à des débris accumulés ou à des rails désalignés.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="leading-[1.85] text-gray-700 text-[1.02rem]">
                Si le bruit persiste, une réparation urgente est généralement nécessaire pour éviter des dommages plus coûteux. Appelez le{" "}
                <a href="tel:4505585788" className="text-brand font-semibold hover:underline">450-558-5788</a>.
              </p>
            </div>
          </div>

          {/* ── Two-col: Télécommande ── */}
          <div className="flex flex-col md:flex-row gap-8 items-center max-w-5xl mx-auto py-8 border-t border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-13_13_30.webp"
              alt="Télécommande de porte de garage ne fonctionnant plus"
              className="w-full md:w-1/2 rounded-xl shadow-md object-cover"
            />
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-brand uppercase mb-4">
                Votre télécommande de porte de garage ne fonctionne plus ?
              </h2>
              <p className="leading-[1.85] text-gray-700 mb-4 text-[1.02rem]">
                Si votre porte et votre ouvre-porte semblent en bon état, mais que la télécommande ne répond plus, le problème peut provenir de plusieurs causes :
              </p>
              <ul className="flex flex-col gap-3 mb-4 text-gray-700">
                {[
                  "Piles faibles ou déchargées – C'est la cause la plus simple et la plus fréquente.",
                  "Interférences de signal – D'autres appareils sans fil à la maison peuvent perturber la communication.",
                  "Erreur de programmation – La télécommande doit peut-être être reprogrammée.",
                  "Récepteur défectueux – Si le bouton mural fonctionne mais pas la télécommande, le problème vient probablement du récepteur.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="leading-[1.85] text-gray-700 text-[1.02rem]">
                Essayez de remplacer les piles ou de reprogrammer la télécommande. Si le problème persiste, appelez le{" "}
                <a href="tel:4505585788" className="text-brand font-semibold hover:underline">450-558-5788</a>{" "}
                pour un diagnostic professionnel.
              </p>
            </div>
          </div>

          {/* ── Avis clients ── */}
          <h2 className="text-2xl font-bold text-brand uppercase text-center mt-14 mb-8 pt-8 border-t-2 border-brand/30">
            Avis de nos clients
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
            {[
              { name: "Service incroyable!", text: "J'ai appelé Experts Portes de Garage pour un ressort brisé. Le tech est arrivé en moins d'une heure, super professionnel, il m'a tout expliqué comme du monde. Ma porte marche mieux qu'avant! Je recommande à 100 %." },
              { name: "Très bonne expérience.", text: "Ma porte gelait tout le temps l'hiver. Lambert est venu, il a ajusté mes rails, changé mon coupe-froid puis m'a donné des conseils pour éviter que ça revienne. Prix honnête, service rapide, rien à dire." },
              { name: "Professionnel, rapide, efficace!", text: "Mon ouvre-porte faisait un drôle de bruit depuis des semaines. Ils sont venus le jour même. Le gars a trouvé le problème en 2 minutes, réparé ça sur place, et m'a fait un petit entretien complet en bonus." },
              { name: "Je les recommande sans hésiter.", text: "J'ai fait remplacer mes câbles et mes roulettes sur une vieille porte. Le travail est propre, le tech est courtois, et ils ne poussent pas de ventes inutiles. C'est rare un service client aussi solide dans ce domaine." },
            ].map((review) => (
              <div key={review.name} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="font-bold text-[#1a1a1a] mb-2">{review.name}</p>
                <p className="text-gray-600 leading-relaxed text-sm">{review.text}</p>
              </div>
            ))}
          </div>

          {/* ── FAQ ── */}
          <h2 className="text-2xl font-bold text-brand uppercase text-center mt-14 mb-8 pt-8 border-t-2 border-brand/30">
            Foire aux questions — Réparation urgente 24/7
          </h2>
          <div className="max-w-[900px] mx-auto flex flex-col gap-6 mb-12">
            {[
              {
                q: "Puis-je utiliser ma porte même si elle est coincée ou si un ressort est cassé ?",
                a: "Non. Utiliser une porte de garage avec un ressort cassé ou coincé peut aggraver les dommages et représenter un danger. Quand un ressort lâche, le poids complet de la porte n'est plus équilibré : forcer l'ouverture peut tordre les rails, casser les câbles ou même faire tomber la porte. Dans ce cas, il est préférable de cesser l'utilisation et de planifier une réparation urgente.",
              },
              {
                q: "En cas d'urgence, vaut-il mieux réparer ou remplacer une porte de garage ?",
                a: "Dans la majorité des cas, une réparation est suffisante : ressorts, câbles, poulies, rails ou moteur peuvent être remplacés sans changer toute la porte. Le remplacement complet est recommandé seulement si la structure est trop endommagée ou si la porte est très vieille.",
              },
              {
                q: "Combien de temps prend une intervention d'urgence pour une porte de garage ?",
                a: "La plupart des interventions d'urgence sont complétées en 30 à 90 minutes, selon le problème (ressort, câble, rail, moteur, etc.). Nos techniciens sont disponibles 24/7 et arrivent rapidement avec tout le matériel nécessaire pour effectuer la réparation sur place.",
              },
              {
                q: "Les réparations urgentes de porte de garage sont-elles garanties ?",
                a: "Oui. Une réparation urgente de porte de garage effectuée par un technicien certifié est généralement couverte par une garantie sur les pièces et/ou la main-d'œuvre, selon le type de réparation.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-l-4 border-brand pl-5 py-1">
                <p className="font-bold text-[#1a1a1a] mb-2">{faq.q}</p>
                <p className="text-gray-600 leading-relaxed text-[0.97rem]">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* ── Bottom CTA ── */}
          <div className="mt-10 border-t-2 border-brand/30 pt-12 flex flex-col items-center gap-5">
            <p className="font-extrabold text-xl text-[#1a1a1a] text-center">
              Prêt à planifier votre service ?
            </p>
            <p className="text-gray-500 text-sm text-center max-w-md">
              Nos techniciens se déplacent rapidement partout en Estrie et Montérégie — 24h/24, 7j/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <PlanifierButton className="bg-brand text-white font-bold px-8 py-3.5 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                Planifier une réparation
              </PlanifierButton>
              <a
                href="tel:4505585788"
                className="border-2 border-brand text-brand font-bold px-8 py-3.5 rounded-lg hover:bg-brand hover:text-white transition-colors text-sm text-center"
              >
                450-558-5788
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
