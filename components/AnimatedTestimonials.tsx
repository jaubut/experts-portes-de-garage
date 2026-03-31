"use client";

import { motion } from "framer-motion";

const testimonials = [
  { name: "Martin L.", city: "Granby", quote: "Service rapide et propre. Le technicien a remplacé tous les joints en moins d'une heure. Plus aucune infiltration d'air!" },
  { name: "Sylvie B.", city: "Bromont", quote: "Enfin un garage qui ne perd plus sa chaleur l'hiver. Le coupe-froid était tellement usé… J'aurais dû appeler avant." },
  { name: "Jean-François T.", city: "Waterloo", quote: "Très professionnel. Il a inspecté toute la porte et m'a expliqué chaque étape. Prix honnête et travail de qualité." },
  { name: "Caroline M.", city: "Cowansville", quote: "Plus d'insectes dans le garage! Le joint de bas de porte était complètement décollé. Réparé en 30 minutes." },
  { name: "Robert D.", city: "Magog", quote: "Intervention le lendemain de mon appel. Technicien ponctuel et courtois. Je recommande sans hésiter." },
  { name: "Isabelle P.", city: "Granby", quote: "Excellent service du début à la fin. La différence est immédiate — plus d'air froid le matin en démarrant la voiture." },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const card = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AnimatedTestimonials() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2">Témoignages</p>
          <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase leading-tight">
            Ce que disent nos clients en Estrie
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={card}
              className="bg-muted rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-bold text-[#1a1a1a] text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{t.city}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
