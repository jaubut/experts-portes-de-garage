"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PHONE_DISPLAY } from "@/lib/config";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  service: string;
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
  service: "",
  codePostal: "",
  adresse: "",
  ville: "",
  nom: "",
  telephone: "",
  courriel: "",
  date: "",
  timeSlot: "",
};

const SERVICES = [
  { id: "reparation-porte", label: "Réparation de porte de garage", desc: "Porte abîmée, bruyante, mal alignée ou lente", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/><circle cx="12" cy="6" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
  )},
  { id: "reparation-urgente", label: "Réparation urgente", desc: "Porte bloquée, ressort cassé, câble brisé", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  )},
  { id: "reparation-ouvre-porte", label: "Réparation d'ouvre-porte", desc: "Moteur, télécommande, capteurs défectueux", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
  )},
  { id: "installation-ouvre-porte", label: "Installation d'ouvre-porte", desc: "Nouveau moteur Belt Drive, Chain Drive, Jackshaft", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
  )},
  { id: "installation-porte", label: "Installation de nouvelle porte", desc: "Porte sectionnelle fournie et installée", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><circle cx="6" cy="12" r="1" fill="currentColor"/></svg>
  )},
  { id: "coupe-froid", label: "Remplacement de coupe-froid", desc: "Joint bas, latéraux, haut de porte", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 8v4l3 3"/></svg>
  )},
  { id: "inspection", label: "Inspection / Entretien", desc: "Inspection complète dès 39,95$", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
  )},
  { id: "autre", label: "Autre / Je ne sais pas", desc: "Un technicien vous guidera", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  )},
];

const TIME_SLOTS = ["10h00 - 11h00", "12h00 - 13h00", "15h00 - 16h00"];

const STEP_LABELS = ["Votre service", "Votre adresse", "Vos coordonnées", "Rendez-vous"];

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

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  hasError: boolean;
}

function Calendar({ value, onChange, hasError }: CalendarProps) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayStr = toDateString(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

  const [viewYear, setViewYear] = useState(() => todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => todayDate.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const canGoPrev = viewYear > todayDate.getFullYear() ||
    (viewYear === todayDate.getFullYear() && viewMonth > todayDate.getMonth());

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={`border rounded-xl overflow-hidden bg-white ${hasError ? "border-red-400" : "border-gray-200"}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Mois précédent"
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
            canGoPrev ? "hover:bg-gray-200 text-gray-600" : "text-gray-300 cursor-not-allowed"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-gray-800">
          {FR_MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Mois suivant"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100">
        {FR_DAYS_SHORT.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-semibold py-2 ${
              i === 0 || i === 6 ? "text-gray-400" : "text-gray-500"
            }`}
          >
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

          if (isSelected) {
            cls += "bg-brand text-white font-bold shadow-sm";
          } else if (isPast) {
            cls += "text-gray-300 cursor-not-allowed";
          } else if (isToday) {
            cls += "border-2 border-brand text-brand font-bold hover:bg-brand/10";
          } else if (isWeekend) {
            cls += "text-gray-500 hover:bg-brand/10 hover:text-brand";
          } else {
            cls += "text-gray-700 hover:bg-brand/10 hover:text-brand";
          }

          return (
            <div
              key={dateStr}
              className={`flex items-center justify-center py-1 ${isWeekend && !isSelected ? "bg-gray-50/60" : ""}`}
            >
              <span
                className={cls}
                onClick={() => { if (!isPast) onChange(dateStr); }}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {value && (
        <div className="px-4 py-2.5 bg-brand/5 border-t border-brand/10 text-center">
          <span className="text-sm font-semibold text-brand capitalize">
            {formatDateFr(value)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [suggestions, setSuggestions] = useState<{ placeId: string; text: string; secondary: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSubmitted(false);
      setIsSubmitting(false);
      setSubmitError("");
      setErrors({});
      setForm(EMPTY_FORM);
      setSuggestions([]);
    }
  }, [isOpen]);

  const fetchSuggestions = useCallback(async (input: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || input.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
        body: JSON.stringify({ input, regionCode: "CA", languageCode: "fr" }),
      });
      const data = await res.json();
      const items = (data.suggestions || []).map((s: { placePrediction: { placeId: string; structuredFormat: { mainText: { text: string }; secondaryText: { text: string } } } }) => ({
        placeId: s.placePrediction.placeId,
        text: s.placePrediction.structuredFormat.mainText.text,
        secondary: s.placePrediction.structuredFormat.secondaryText.text,
      }));
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } catch { setSuggestions([]); }
  }, []);

  const handleAdresseChange = (value: string) => {
    setForm(f => ({ ...f, adresse: value, ville: "", codePostal: "" }));
    setErrors(e => ({ ...e, adresse: "", ville: "", codePostal: "" }));
    setAddressVerified(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const selectSuggestion = async (placeId: string, text: string) => {
    setShowSuggestions(false);
    setSuggestions([]);
    update("adresse", text);
    setAddressVerified(true);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=addressComponents,location&languageCode=fr`, {
        headers: { "X-Goog-Api-Key": apiKey },
      });
      const place = await res.json();
      let streetNumber = "", route = "", city = "", postalCode = "";
      for (const c of (place.addressComponents || [])) {
        if (c.types.includes("street_number")) streetNumber = c.longText;
        if (c.types.includes("route")) route = c.longText;
        if (c.types.includes("locality")) city = c.longText;
        if (c.types.includes("postal_code")) postalCode = c.longText;
      }
      if (streetNumber || route) setForm(f => ({ ...f, adresse: `${streetNumber} ${route}`.trim() }));
      if (city) setForm(f => ({ ...f, ville: city }));
      if (postalCode) setForm(f => ({ ...f, codePostal: postalCode }));

      // Vérifier la distance depuis Granby (max 60 km)
      if (place.location) {
        const dist = haversineKm(place.location.latitude, place.location.longitude, 45.3972, -72.7330);
        if (dist > 60) {
          setErrors(e => ({ ...e, adresse: `Cette adresse est à ${Math.round(dist)} km de Granby — hors de notre zone de service (60 km max). Appelez-nous au 450-558-5788.` }));
        }
      }
    } catch { /* keep typed value */ }
  };

  const update = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  if (!isOpen) return null;

  const validateStep = (): boolean => {
    const errs: Partial<FormData> = {};
    if (step === 1) {
      if (!form.service) errs.service = "Veuillez choisir un service";
    } else if (step === 2) {
      if (!form.adresse.trim()) {
        errs.adresse = "Ce champ est requis";
      } else if (!addressVerified) {
        errs.adresse = "Veuillez sélectionner une adresse dans la liste pour valider.";
      }
      if (!form.codePostal.trim()) errs.codePostal = "Ce champ est requis";
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

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      setIsSubmitting(true);
      setSubmitError("");
      try {
        const res = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        setSubmitted(true);
      } catch {
        setSubmitError(`Une erreur est survenue. Veuillez réessayer ou nous appeler au ${PHONE_DISPLAY}.`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const prenom = form.nom.trim().split(/\s+/)[0] || "vous";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-brand px-6 py-4 flex items-center justify-between gap-4">
          <span className="font-heading text-white text-base sm:text-lg leading-tight uppercase">
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

        <div className="bg-brand-dark px-6 py-2.5">
          <p className="text-white/90 text-sm text-center font-medium">
            Service rapide de porte de garage — Réparation ou remplacement.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-9 h-9 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-brand uppercase mb-3">Demande envoyée!</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Merci {prenom}! Nous vous contacterons pour confirmer votre rendez-vous.
              </p>
              <button
                onClick={onClose}
                className="bg-brand text-white font-bold px-10 py-3 rounded-lg hover:bg-brand-dark transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* Step indicators */}
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        s === step
                          ? "bg-brand text-white"
                          : s < step
                            ? "bg-brand/20 text-brand"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {s < step ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-7">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>

              {/* Step 1 — Service */}
              {step === 1 && (
                <div className="flex flex-col gap-2">
                  {errors.service && <p className="text-xs text-red-500 mb-1">{errors.service}</p>}
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => update("service", s.id)}
                      className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 text-left transition-all w-full ${
                        form.service === s.id
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-gray-200 text-gray-700 hover:border-brand/40"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${form.service === s.id ? "text-brand" : "text-gray-400"}`}>{s.icon}</span>
                      <div>
                        <p className="font-semibold text-sm leading-tight">{s.label}</p>
                        <p className="text-xs text-gray-400 leading-tight mt-0.5">{s.desc}</p>
                      </div>
                      {form.service === s.id && (
                        <svg className="w-4 h-4 text-brand ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2 — Adresse */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <Field label="Adresse complète" error={errors.adresse}>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.adresse}
                        onChange={(e) => handleAdresseChange(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="123 rue Principale"
                        autoComplete="off"
                        className={inputCls(!!errors.adresse)}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          {suggestions.map((s) => (
                            <li key={s.placeId}>
                              <button
                                type="button"
                                onMouseDown={() => selectSuggestion(s.placeId, s.text)}
                                className="w-full text-left px-4 py-3 hover:bg-brand/5 flex flex-col gap-0.5 border-b border-gray-100 last:border-0"
                              >
                                <span className="text-sm font-semibold text-gray-800">{s.text}</span>
                                <span className="text-xs text-gray-400">{s.secondary}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Field>
                  <Field label="Ville" error={errors.ville}>
                    <input
                      type="text"
                      value={form.ville}
                      readOnly
                      placeholder="Rempli automatiquement"
                      className={`${inputCls(!!errors.ville)} bg-gray-50 text-gray-500 cursor-default`}
                    />
                  </Field>
                  <Field label="Code postal" error={errors.codePostal}>
                    <input
                      type="text"
                      value={form.codePostal}
                      readOnly
                      placeholder="Rempli automatiquement"
                      className={`${inputCls(!!errors.codePostal)} bg-gray-50 text-gray-500 cursor-default`}
                    />
                  </Field>
                </div>
              )}

              {/* Step 3 — Coordonnées */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <Field label="Prénom et Nom" error={errors.nom}>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => update("nom", e.target.value)}
                      placeholder="Jean Tremblay"
                      autoComplete="name"
                      className={inputCls(!!errors.nom)}
                    />
                  </Field>
                  <Field label="Numéro de téléphone" error={errors.telephone}>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => update("telephone", e.target.value)}
                      placeholder="450-558-5788"
                      autoComplete="tel"
                      className={inputCls(!!errors.telephone)}
                    />
                  </Field>
                  <Field label="Adresse courriel" error={errors.courriel}>
                    <input
                      type="email"
                      value={form.courriel}
                      onChange={(e) => update("courriel", e.target.value)}
                      placeholder="jean@exemple.com"
                      autoComplete="email"
                      className={inputCls(!!errors.courriel)}
                    />
                  </Field>
                </div>
              )}

              {/* Step 4 — Rendez-vous */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="block text-sm font-semibold text-gray-700 mb-2">Date souhaitée</p>
                    {errors.date && <p className="text-xs text-red-500 mb-2">{errors.date}</p>}
                    <Calendar
                      value={form.date}
                      onChange={(d) => update("date", d)}
                      hasError={!!errors.date}
                    />
                  </div>
                  <div>
                    <p className="block text-sm font-semibold text-gray-700 mb-2">Plage horaire</p>
                    {errors.timeSlot && <p className="text-xs text-red-500 mb-2">{errors.timeSlot}</p>}
                    <div className="flex flex-col gap-2.5">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => update("timeSlot", slot)}
                          className={`border-2 rounded-xl py-4 px-4 text-base font-bold text-center transition-all w-full ${
                            form.timeSlot === slot
                              ? "border-brand bg-brand text-white shadow-md"
                              : "border-gray-200 text-gray-700 hover:border-brand hover:text-brand"
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
              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-6">{submitError}</p>
              )}
              <div className={`flex items-center mt-4 ${step > 1 ? "justify-between" : "justify-end"}`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    disabled={isSubmitting}
                    className="text-sm font-semibold text-gray-400 hover:text-brand transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-brand text-white font-bold px-7 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Envoi en cours..." : step === 4 ? "Confirmer la réservation" : "Suivant"}
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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inputCls(hasError: boolean) {
  return `w-full border rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-400 focus:ring-red-200 focus:border-red-400"
      : "border-gray-200 focus:ring-brand/20 focus:border-brand"
  }`;
}
