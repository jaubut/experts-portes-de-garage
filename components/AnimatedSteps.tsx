"use client";

import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Inspection complète", desc: "Évaluation de tous les joints de votre porte et identification des zones à risque." },
  { num: "02", title: "Retrait de l'ancien joint", desc: "Enlèvement soigneux du joint usé sans endommager la porte ou le cadre." },
  { num: "03", title: "Nettoyage de la surface", desc: "La surface est nettoyée et préparée pour assurer une adhérence optimale du nouveau joint." },
  { num: "04", title: "Installation professionnelle", desc: "Pose d'un joint haute qualité EPDM ou vinyle renforcé, adapté à vos dimensions exactes." },
  { num: "05", title: "Test d'étanchéité garanti", desc: "Vérification que la porte ferme parfaitement et que l'étanchéité est assurée de tous les côtés." },
];

export default function AnimatedSteps() {
  return (
    <section className="bg-muted py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2">Notre processus</p>
          <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] uppercase leading-tight">
            Un remplacement simple, rapide et garanti
          </h2>
        </motion.div>

        <div className="flex flex-col gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex items-start gap-5"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-12 h-12 rounded-full bg-brand flex items-center justify-center shrink-0"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.1 + 0.1 }}
                >
                  <span className="font-heading text-white text-sm font-bold">{step.num}</span>
                </motion.div>
                {i < steps.length - 1 && (
                  <motion.div
                    className="w-0.5 bg-brand/20 my-1"
                    initial={{ height: 0 }}
                    whileInView={{ height: 32 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
                  />
                )}
              </div>
              <div className="pb-8 pt-2">
                <p className="font-bold text-[#1a1a1a] mb-1">{step.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
