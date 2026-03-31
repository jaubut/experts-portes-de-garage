"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const painPoints = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
    title: "Le froid s'infiltre",
    desc: "Un joint usé laisse entrer l'air glacial, rendant votre garage inutilisable en hiver et faisant grimper vos factures de chauffage.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992Z" />
      </svg>
    ),
    title: "L'humidité et l'eau pénètrent",
    desc: "L'eau de pluie et la neige fondue s'infiltrent sous la porte, risquant d'endommager le plancher, vos outils et votre véhicule.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    title: "Insectes et nuisibles entrent",
    desc: "Les petits espaces autour de la porte sont une invitation pour les insectes, les rongeurs et la poussière — même porte fermée.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
    title: "Pertes d'énergie coûteuses",
    desc: "Un coupe-froid défectueux peut représenter jusqu'à 20% de pertes de chaleur dans un garage chauffé, sans que vous le sachiez.",
  },
];

const desktopContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const desktopItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const AUTOPLAY_INTERVAL = 3000;

export default function AnimatedPainPoints() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % painPoints.length);
    }, AUTOPLAY_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }),
  };

  const p = painPoints[current];

  return (
    <section className="bg-[#1a1a1a] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="font-heading text-2xl md:text-3xl text-white text-center uppercase mb-3">
            Un coupe-froid usé coûte plus cher que vous ne le pensez
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto text-sm">
            Ne laissez pas un joint défectueux compromettre le confort, la sécurité et l&apos;efficacité de votre garage.
          </p>
        </motion.div>

        {/* ── Mobile carousel ── */}
        <div className="sm:hidden">
          <div
            className="relative overflow-hidden rounded-xl cursor-pointer select-none"
            onClick={() => setPaused((p) => !p)}
          >
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center text-brand shrink-0">
                  {p.icon}
                </div>
                <h3 className="font-bold text-white text-base">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                <p className="text-white/30 text-xs mt-1 text-right">
                  {paused ? "Appuyez pour reprendre" : "Appuyez pour pause"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {painPoints.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Carte ${i + 1}`}
                onClick={() => { goTo(i); setPaused(true); }}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-brand w-5" : "bg-white/20"}`}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop grid (unchanged) ── */}
        <motion.div
          className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-5"
          variants={desktopContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {painPoints.map((p) => (
            <motion.div
              key={p.title}
              variants={desktopItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-3 cursor-default"
            >
              <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center text-brand shrink-0">
                {p.icon}
              </div>
              <h3 className="font-bold text-white text-base">{p.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
