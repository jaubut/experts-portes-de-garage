"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  codePostal: string;
  adresse: string;
  ville: string;
  nom: string;
  telephone: string;
  courriel: string;
  date: string;
  timeSlot: string;
}

const EMPTY_FORM: FormData = {
  codePostal: "",
  adresse: "",
  ville: "",
  nom: "",
  telephone: "",
  courriel: "",
  date: "",
  timeSlot: "",
};

const TIME_SLOTS = ["9h00 - 10h00", "11h00 - 12h00", "13h00 - 14h00"];

const STEP_LABELS = ["Votre adresse", "Vos coordonnées", "Choisir un rendez-vous"];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSubmitted(false);
      setErrors({});
      setForm(EMPTY_FORM);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep = (): boolean => {
    const errs: Partial<FormData> = {};
    if (step === 1) {
      if (!form.codePostal.trim()) errs.codePostal = "Ce champ est requis";
      if (!form.adresse.trim()) errs.adresse = "Ce champ est requis";
      if (!form.ville.trim()) errs.ville = "Ce champ est requis";
    } else if (step === 2) {
      if (!form.nom.trim()) errs.nom = "Ce champ est requis";
      if (!form.telephone.trim()) errs.telephone = "Ce champ est requis";
      if (!form.courriel.trim()) {
        errs.courriel = "Ce champ est requis";
      } else if (!/\S+@\S+\.\S+/.test(form.courriel)) {
        errs.courriel = "Adresse courriel invalide";
      }
    } else if (step === 3) {
      if (!form.date) errs.date = "Veuillez choisir une date";
      if (!form.timeSlot) errs.timeSlot = "Veuillez choisir une plage horaire";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      setSubmitted(true);
    }
  };

  const prenom = form.nom.trim().split(/\s+/)[0] || "vous";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
        {/* Top header bar */}
        <div className="bg-brand px-5 py-4 flex items-center justify-between gap-4">
          <Image
            src="https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-14_03_41.webp"
            alt="Experts Portes de Garage"
            width={140}
            height={46}
            className="h-9 w-auto object-contain brightness-0 invert shrink-0"
          />
          <span className="text-white font-bold text-sm sm:text-base leading-tight text-right">
            Réservez votre service
          </span>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-white/70 hover:text-white transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sub-header bar */}
        <div className="bg-[#aa0000] px-5 py-2.5">
          <p className="text-white/95 text-sm text-center font-medium">
            Service rapide de porte de garage – Réparation ou remplacement.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-9 h-9 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-brand mb-3">Demande envoyée!</h3>
              <p className="text-gray-600 leading-relaxed">
                Merci {prenom}!{" "}
                Nous vous contacterons pour confirmer votre rendez-vous.
              </p>
              <button
                onClick={onClose}
                className="mt-7 bg-brand text-white font-bold px-10 py-3 rounded-lg hover:bg-brand-dark transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="mb-7">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-brand">Étape {step} / 3</span>
                  <span className="text-gray-500 font-medium">{STEP_LABELS[step - 1]}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step 1 — Adresse */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <Field label="Code postal" error={errors.codePostal}>
                    <input
                      type="text"
                      value={form.codePostal}
                      onChange={(e) => update("codePostal", e.target.value)}
                      placeholder="ex: J2G 3A1"
                      className={inputCls(!!errors.codePostal)}
                    />
                  </Field>
                  <Field label="Adresse complète" error={errors.adresse}>
                    <input
                      type="text"
                      value={form.adresse}
                      onChange={(e) => update("adresse", e.target.value)}
                      placeholder="123 rue Principale"
                      className={inputCls(!!errors.adresse)}
                    />
                  </Field>
                  <Field label="Ville" error={errors.ville}>
                    <input
                      type="text"
                      value={form.ville}
                      onChange={(e) => update("ville", e.target.value)}
                      placeholder="Granby"
                      className={inputCls(!!errors.ville)}
                    />
                  </Field>
                </div>
              )}

              {/* Step 2 — Coordonnées */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <Field label="Prénom et Nom" error={errors.nom}>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => update("nom", e.target.value)}
                      placeholder="Jean Tremblay"
                      className={inputCls(!!errors.nom)}
                    />
                  </Field>
                  <Field label="Numéro de téléphone" error={errors.telephone}>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => update("telephone", e.target.value)}
                      placeholder="450-558-5788"
                      className={inputCls(!!errors.telephone)}
                    />
                  </Field>
                  <Field label="Adresse courriel" error={errors.courriel}>
                    <input
                      type="email"
                      value={form.courriel}
                      onChange={(e) => update("courriel", e.target.value)}
                      placeholder="jean@exemple.com"
                      className={inputCls(!!errors.courriel)}
                    />
                  </Field>
                </div>
              )}

              {/* Step 3 — Rendez-vous */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <Field label="Date souhaitée" error={errors.date}>
                    <input
                      type="date"
                      value={form.date}
                      min={today}
                      onChange={(e) => update("date", e.target.value)}
                      className={inputCls(!!errors.date)}
                    />
                  </Field>
                  <div>
                    <p className="block text-sm font-semibold text-gray-700 mb-2">Plage horaire</p>
                    {errors.timeSlot && (
                      <p className="text-xs text-red-500 mb-2">{errors.timeSlot}</p>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => update("timeSlot", slot)}
                          className={`border-2 rounded-xl py-4 px-2 text-sm font-bold text-center transition-all ${
                            form.timeSlot === slot
                              ? "border-brand bg-brand text-white shadow-md scale-[1.02]"
                              : "border-gray-200 text-gray-600 hover:border-brand hover:text-brand"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className={`flex items-center mt-8 ${step > 1 ? "justify-between" : "justify-end"}`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="text-sm font-semibold text-gray-400 hover:text-brand transition-colors"
                  >
                    ← Retour
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-brand text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm"
                >
                  {step === 3 ? "Confirmer la réservation" : "Suivant →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-400 focus:ring-red-200 focus:border-red-400"
      : "border-gray-200 focus:ring-brand/20 focus:border-brand"
  }`;
}
