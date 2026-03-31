"use client";

import { useState } from "react";

interface FormData {
  seals: string[];
  condition: string;
  notes: string;
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
  seals: [],
  condition: "",
  notes: "",
  codePostal: "",
  adresse: "",
  ville: "",
  nom: "",
  telephone: "",
  courriel: "",
  date: "",
  timeSlot: "",
};

const SEAL_OPTIONS = [
  { id: "bas", label: "Joint de bas de porte" },
  { id: "lateraux", label: "Joints latéraux" },
  { id: "tete", label: "Joint de tête" },
  { id: "seuil", label: "Joint de seuil" },
  { id: "inconnu", label: "Je ne sais pas / Inspection complète" },
];

const CONDITION_OPTIONS = [
  { id: "craquele", label: "Craquelé ou durci" },
  { id: "decolle", label: "Décollé ou arraché" },
  { id: "infiltration", label: "Infiltrations d'air ou d'eau" },
  { id: "insectes", label: "Insectes ou nuisibles" },
  { id: "autre", label: "Autre / Je ne sais pas" },
];

const TIME_SLOTS = ["10h00 - 11h00", "12h00 - 13h00", "15h00 - 16h00"];

const STEP_LABELS = ["Votre situation", "Votre adresse", "Vos coordonnées", "Rendez-vous"];

const FR_MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const FR_MONTHS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const FR_DAYS_SHORT = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
const FR_DAYS_LONG = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function toDateString(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDateFr(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${FR_DAYS_LONG[dow]} ${d} ${FR_MONTHS_LONG[m - 1]} ${y}`;
}

function Calendar({ value, onChange, hasError }: { value: string; onChange: (d: string) => void; hasError: boolean }) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayStr = toDateString(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  const [viewYear, setViewYear] = useState(() => todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => todayDate.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const canGoPrev =
    viewYear > todayDate.getFullYear() ||
    (viewYear === todayDate.getFullYear() && viewMonth > todayDate.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={`border rounded-xl overflow-hidden bg-white ${hasError ? "border-red-400" : "border-gray-200"}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <button type="button" onClick={prevMonth} disabled={!canGoPrev}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${canGoPrev ? "hover:bg-gray-200 text-gray-600" : "text-gray-300 cursor-not-allowed"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-gray-800">{FR_MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-100">
        {FR_DAYS_SHORT.map((d, i) => (
          <div key={d} className={`text-center text-xs font-semibold py-2 ${i === 0 || i === 6 ? "text-gray-400" : "text-gray-500"}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} className="py-1.5" />;
          const dateStr = toDateString(viewYear, viewMonth, day);
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === value;
          const col = idx % 7;
          const isWeekend = col === 0 || col === 6;
          let cls = "relative mx-auto flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium cursor-pointer transition-all select-none ";
          if (isSelected) cls += "bg-brand text-white font-bold shadow-sm";
          else if (isPast) cls += "text-gray-300 cursor-not-allowed";
          else if (isToday) cls += "border-2 border-brand text-brand font-bold hover:bg-brand/10";
          else if (isWeekend) cls += "text-gray-500 hover:bg-brand/10 hover:text-brand";
          else cls += "text-gray-700 hover:bg-brand/10 hover:text-brand";
          return (
            <div key={dateStr} className={`flex items-center justify-center py-1 ${isWeekend && !isSelected ? "bg-gray-50/60" : ""}`}>
              <span className={cls} onClick={() => { if (!isPast) onChange(dateStr); }}>{day}</span>
            </div>
          );
        })}
      </div>
      {value && (
        <div className="px-4 py-2.5 bg-brand/5 border-t border-brand/10 text-center">
          <span className="text-sm font-semibold text-brand capitalize">{formatDateFr(value)}</span>
        </div>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    hasError ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200 focus:ring-brand/20 focus:border-brand"
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function WeatherSealBookingForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const toggleSeal = (id: string) => {
    setForm((f) => {
      const seals = f.seals.includes(id) ? f.seals.filter((s) => s !== id) : [...f.seals, id];
      return { ...f, seals };
    });
    setErrors((e) => ({ ...e, seals: "" }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (form.seals.length === 0) errs.seals = "Sélectionnez au moins une option";
      if (!form.condition) errs.condition = "Sélectionnez la situation actuelle";
    } else if (step === 2) {
      if (!form.codePostal.trim()) errs.codePostal = "Ce champ est requis";
      if (!form.adresse.trim()) errs.adresse = "Ce champ est requis";
      if (!form.ville.trim()) errs.ville = "Ce champ est requis";
    } else if (step === 3) {
      if (!form.nom.trim()) errs.nom = "Ce champ est requis";
      if (!form.telephone.trim()) errs.telephone = "Ce champ est requis";
      if (!form.courriel.trim()) {
        errs.courriel = "Ce champ est requis";
      } else if (!/\S+@\S+\.\S+/.test(form.courriel)) {
        errs.courriel = "Adresse courriel invalide";
      }
    } else if (step === 4) {
      if (!form.date) errs.date = "Veuillez choisir une date";
      if (!form.timeSlot) errs.timeSlot = "Veuillez choisir une plage horaire";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < 4) setStep((s) => s + 1);
    else setSubmitted(true);
  };

  const prenom = form.nom.trim().split(/\s+/)[0] || "vous";

  return (
    <section className="bg-[#1a1a1a] py-16" id="reserver">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-brand font-bold text-sm uppercase tracking-widest mb-2">Réservez maintenant</p>
          <h2 className="font-heading text-2xl md:text-3xl text-white uppercase leading-tight mb-3">
            Planifiez votre remplacement de coupe-froid
          </h2>
          <p className="text-gray-400 text-sm">
            Sans engagement · Réponse rapide · Inspection + lubrification offertes
          </p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {submitted ? (
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-9 h-9 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-brand uppercase mb-3">Demande envoyée!</h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                Merci {prenom}! Nous vous contacterons sous peu pour confirmer votre rendez-vous de remplacement de coupe-froid.
              </p>
            </div>
          ) : (
            <div className="px-6 sm:px-8 py-8">

              {/* Step indicators */}
              <div className="flex items-start gap-1 mb-6">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      s === step ? "bg-brand text-white" : s < step ? "bg-brand/20 text-brand" : "bg-gray-100 text-gray-400"
                    }`}>
                      {s < step ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s}
                    </div>
                    <span className={`text-[9px] font-semibold text-center leading-tight ${s === step ? "text-brand" : "text-gray-400"}`}>
                      {STEP_LABELS[s - 1]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-brand rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
              </div>

              {/* ── Step 1 — Service details ── */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Quel(s) joint(s) souhaitez-vous remplacer?</p>
                    <p className="text-xs text-gray-400 mb-3">Sélectionnez tout ce qui s&apos;applique</p>
                    {(errors.seals) && <p className="text-xs text-red-500 mb-2">{errors.seals}</p>}
                    <div className="flex flex-col gap-2">
                      {SEAL_OPTIONS.map((opt) => {
                        const checked = form.seals.includes(opt.id);
                        return (
                          <button key={opt.id} type="button" onClick={() => toggleSeal(opt.id)}
                            className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 text-left transition-all ${
                              checked ? "border-brand bg-brand/5" : "border-gray-200 hover:border-brand/40"
                            }`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                              checked ? "bg-brand" : "border-2 border-gray-300"
                            }`}>
                              {checked && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${checked ? "text-brand" : "text-gray-700"}`}>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Quelle est la situation actuelle?</p>
                    {errors.condition && <p className="text-xs text-red-500 mb-2">{errors.condition}</p>}
                    <div className="flex flex-col gap-2">
                      {CONDITION_OPTIONS.map((opt) => {
                        const selected = form.condition === opt.id;
                        return (
                          <button key={opt.id} type="button" onClick={() => update("condition", opt.id)}
                            className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 text-left transition-all ${
                              selected ? "border-brand bg-brand/5" : "border-gray-200 hover:border-brand/40"
                            }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              selected ? "bg-brand" : "border-2 border-gray-300"
                            }`}>
                              {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className={`text-sm font-medium ${selected ? "text-brand" : "text-gray-700"}`}>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field label="Informations supplémentaires (optionnel)">
                    <textarea
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Décrivez votre situation, le type de porte, toute information utile..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
                    />
                  </Field>
                </div>
              )}

              {/* ── Step 2 — Address ── */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <Field label="Code postal" error={errors.codePostal}>
                    <input type="text" value={form.codePostal} onChange={(e) => update("codePostal", e.target.value)}
                      placeholder="ex: J2G 3A1" className={inputCls(!!errors.codePostal)} />
                  </Field>
                  <Field label="Adresse complète" error={errors.adresse}>
                    <input type="text" value={form.adresse} onChange={(e) => update("adresse", e.target.value)}
                      placeholder="123 rue Principale" className={inputCls(!!errors.adresse)} />
                  </Field>
                  <Field label="Ville" error={errors.ville}>
                    <input type="text" value={form.ville} onChange={(e) => update("ville", e.target.value)}
                      placeholder="Granby" className={inputCls(!!errors.ville)} />
                  </Field>
                </div>
              )}

              {/* ── Step 3 — Contact ── */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <Field label="Prénom et Nom" error={errors.nom}>
                    <input type="text" value={form.nom} onChange={(e) => update("nom", e.target.value)}
                      placeholder="Jean Tremblay" className={inputCls(!!errors.nom)} />
                  </Field>
                  <Field label="Numéro de téléphone" error={errors.telephone}>
                    <input type="tel" value={form.telephone} onChange={(e) => update("telephone", e.target.value)}
                      placeholder="450-558-5788" className={inputCls(!!errors.telephone)} />
                  </Field>
                  <Field label="Adresse courriel" error={errors.courriel}>
                    <input type="email" value={form.courriel} onChange={(e) => update("courriel", e.target.value)}
                      placeholder="jean@exemple.com" className={inputCls(!!errors.courriel)} />
                  </Field>
                </div>
              )}

              {/* ── Step 4 — Date / Time ── */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Date souhaitée</p>
                    {errors.date && <p className="text-xs text-red-500 mb-2">{errors.date}</p>}
                    <Calendar value={form.date} onChange={(d) => update("date", d)} hasError={!!errors.date} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Plage horaire</p>
                    {errors.timeSlot && <p className="text-xs text-red-500 mb-2">{errors.timeSlot}</p>}
                    <div className="flex flex-col gap-2.5">
                      {TIME_SLOTS.map((slot) => (
                        <button key={slot} type="button" onClick={() => update("timeSlot", slot)}
                          className={`border-2 rounded-xl py-4 px-4 text-base font-bold text-center transition-all w-full ${
                            form.timeSlot === slot ? "border-brand bg-brand text-white shadow-md" : "border-gray-200 text-gray-700 hover:border-brand hover:text-brand"
                          }`}>
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
                  <button type="button" onClick={() => setStep((s) => s - 1)}
                    className="text-sm font-semibold text-gray-400 hover:text-brand transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                )}
                <button type="button" onClick={handleNext}
                  className="bg-brand text-white font-bold px-7 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm shadow-sm">
                  {step === 4 ? "Confirmer la réservation" : "Suivant"}
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-gray-500 text-xs">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Sans engagement
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Réponse sous 24h
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Inspection + lubrification offertes
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Techniciens certifiés
          </span>
        </div>
      </div>
    </section>
  );
}
