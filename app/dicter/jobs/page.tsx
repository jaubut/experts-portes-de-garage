"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const MOT_DE_PASSE = "l1a2m3B5";

type Statut = "a_faire" | "en_cours" | "complete";

interface Job {
  id: string;
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  date: string;
  heure: string | null;
  statut: Statut;
  notes: string | null;
}

const STATUT_LABELS: Record<Statut, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  complete: "Complété",
};

const STATUT_COLORS: Record<Statut, string> = {
  a_faire: "bg-red-100 text-red-700 border-red-200",
  en_cours: "bg-yellow-100 text-yellow-700 border-yellow-200",
  complete: "bg-green-100 text-green-700 border-green-200",
};

const STATUT_NEXT: Record<Statut, Statut> = {
  a_faire: "en_cours",
  en_cours: "complete",
  complete: "a_faire",
};

function mapsUrl(adresse: string, ville: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${adresse}, ${ville}, QC`)}`;
}

function itineraireUrl(adresses: string[]) {
  if (adresses.length === 0) return null;
  if (adresses.length === 1) return `https://www.google.com/maps/search/?api=1&query=${adresses[0]}`;
  return `https://www.google.com/maps/dir/${adresses.join("/")}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
}

function groupByDate(jobs: Job[]) {
  return jobs.reduce<Record<string, Job[]>>((acc, job) => {
    if (!acc[job.date]) acc[job.date] = [];
    acc[job.date].push(job);
    return acc;
  }, {});
}

function groupByVille(jobs: Job[]) {
  return jobs.reduce<Record<string, Job[]>>((acc, job) => {
    if (!acc[job.ville]) acc[job.ville] = [];
    acc[job.ville].push(job);
    return acc;
  }, {});
}

async function geocoderAdresse(adresse: string, ville: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const q = encodeURIComponent(`${adresse}, ${ville}, Quebec, Canada`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ca`,
      { headers: { "Accept-Language": "fr" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch { return null; }
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}


function nowDateStr() {
  return new Date().toISOString().split("T")[0];
}

function nowHeureStr() {
  return new Date().toTimeString().slice(0, 5);
}

const FORM_VIDE = { nom: "", telephone: "", adresse: "", ville: "", date: "", heure: "", notes: "" };

export default function JobsPage() {
  const [auth, setAuth] = useState(false);
  const [mdp, setMdp] = useState("");
  const [mdpErreur, setMdpErreur] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showFiltres, setShowFiltres] = useState(false);
  const [filtreVille, setFiltreVille] = useState("");
  const [filtreDate, setFiltreDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [suggestions, setSuggestions] = useState<Array<{adresse: string; ville: string; label: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mode itinéraire
  const [modeItineraire, setModeItineraire] = useState(false);
  const [selectionIds, setSelectionIds] = useState<Set<string>>(new Set());
  const [optimisant, setOptimisant] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("dicter_auth");
    if (saved === MOT_DE_PASSE) setAuth(true);
  }, []);

  // Pré-remplir depuis Leads (via sessionStorage)
  useEffect(() => {
    const prefill = sessionStorage.getItem("job_prefill");
    if (!prefill) return;
    sessionStorage.removeItem("job_prefill");
    try {
      const data = JSON.parse(prefill);
      setForm({ ...FORM_VIDE, date: nowDateStr(), heure: nowHeureStr(), ...data });
      setShowForm(true);
    } catch { /* ignore */ }
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth) fetchJobs();
  }, [auth, fetchJobs]);

  function soumettreMdp(e: React.FormEvent) {
    e.preventDefault();
    if (mdp === MOT_DE_PASSE) {
      sessionStorage.setItem("dicter_auth", mdp);
      setAuth(true);
    } else {
      setMdpErreur(true);
    }
  }

  function ouvrirFormulaire() {
    setForm(f => ({
      ...f,
      date: f.date || nowDateStr(),
      heure: f.heure || nowHeureStr(),
    }));
    setShowForm(true);
  }

  async function ajouterJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(FORM_VIDE);
    setShowForm(false);
    await fetchJobs();
    setSaving(false);
  }

  async function changerStatut(job: Job) {
    const next = STATUT_NEXT[job.statut];
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, statut: next } : j));
    await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
  }

  async function supprimerJob(id: string) {
    if (!confirm("Supprimer ce job?")) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
  }

  function rechercherAdresse(query: string) {
    setForm(f => ({ ...f, adresse: query }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 4) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Quebec, Canada")}&format=json&addressdetails=1&limit=6&countrycodes=ca`,
          { headers: { "Accept-Language": "fr" } }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = await res.json();
        const results = data
          .filter(r => r.address?.road)
          .map(r => {
            const num = r.address.house_number ?? "";
            const rue = r.address.road ?? "";
            const ville = r.address.city ?? r.address.town ?? r.address.village ?? r.address.municipality ?? "";
            return {
              adresse: `${num} ${rue}`.trim(),
              ville,
              label: [num, rue, ville].filter(Boolean).join(", "),
            };
          })
          .filter(r => r.adresse && r.ville);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch { /* ignore */ }
    }, 400);
  }

  function choisirSuggestion(s: { adresse: string; ville: string }) {
    setForm(f => ({ ...f, adresse: s.adresse, ville: s.ville }));
    setSuggestions([]);
    setShowSuggestions(false);
  }

  // Itinéraire — sélection
  function toggleSelection(id: string) {
    setSelectionIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleVille(villeJobs: Job[]) {
    const ids = villeJobs.map(j => j.id);
    const tousCoches = ids.every(id => selectionIds.has(id));
    setSelectionIds(prev => {
      const next = new Set(prev);
      if (tousCoches) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  }

  function entrerModeItineraire() {
    // Pré-sélectionner les jobs à faire d'aujourd'hui
    const aujourd_hui = nowDateStr();
    const ids = jobs
      .filter(j => j.statut !== "complete" && j.date === aujourd_hui)
      .map(j => j.id);
    setSelectionIds(new Set(ids));
    setModeItineraire(true);
  }

  async function genererItineraire() {
    const jobsSelectionnes = jobs.filter(j => selectionIds.has(j.id));
    if (jobsSelectionnes.length === 0) return;

    setOptimisant(true);
    try {
      // 1. Récupérer la position GPS actuelle (optionnel)
      let positionActuelle: { lat: number; lon: number } | null = null;
      try {
        positionActuelle = await new Promise((resolve) => {
          if (!navigator.geolocation) { resolve(null); return; }
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 5000, maximumAge: 60000 }
          );
        });
      } catch { /* GPS non disponible, pas grave */ }

      // 2. Géocoder une par une (Nominatim = max 1 req/sec)
      const coordonnees: Array<{ lat: number; lon: number } | null> = [];
      for (const j of jobsSelectionnes) {
        coordonnees.push(await geocoderAdresse(j.adresse, j.ville));
        if (jobsSelectionnes.length > 1) await new Promise(r => setTimeout(r, 1100));
      }

      // 3. Attacher les coordonnées aux jobs
      const avecCoords = jobsSelectionnes
        .map((j, i) => ({ ...j, ...(coordonnees[i] ?? { lat: 0, lon: 0 }) }))
        .filter(j => j.lat !== 0);
      const sansCoords = jobsSelectionnes.filter((_, i) => !coordonnees[i]);

      // 4. Optimiser depuis la position actuelle (ou depuis le premier job)
      const pointDepart = positionActuelle ?? (avecCoords[0] ?? null);
      let optimises: typeof avecCoords;
      if (pointDepart && avecCoords.length > 1) {
        // Nearest neighbor en partant de la position actuelle
        const restants = [...avecCoords];
        optimises = [];
        let courant = pointDepart;
        while (restants.length > 0) {
          let idx = 0;
          let minDist = Infinity;
          for (let i = 0; i < restants.length; i++) {
            const d = distanceKm(courant, restants[i]);
            if (d < minDist) { minDist = d; idx = i; }
          }
          const suivant = restants.splice(idx, 1)[0];
          optimises.push(suivant);
          courant = suivant;
        }
      } else {
        optimises = avecCoords;
      }

      const tousEnOrdre = [...optimises, ...sansCoords];

      // 5. Construire l'URL Maps — position GPS en premier si disponible
      const stops = tousEnOrdre.map(j => encodeURIComponent(`${j.adresse}, ${j.ville}, QC`));
      let url: string;
      if (positionActuelle) {
        const depart = `${positionActuelle.lat},${positionActuelle.lon}`;
        url = stops.length === 1
          ? `https://www.google.com/maps/dir/${depart}/${stops[0]}`
          : `https://www.google.com/maps/dir/${depart}/${stops.join("/")}`;
      } else {
        url = itineraireUrl(stops) ?? "";
      }

      if (url) window.open(url, "_blank");
    } finally {
      setOptimisant(false);
    }
  }

  if (!auth) {
    return (
      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center px-4">
        <form onSubmit={soumettreMdp} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <p className="text-gray-400 text-sm text-center mb-2 uppercase tracking-widest">Experts Portes de Garage</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6 text-center">Espace admin</h1>
          <input
            type="password"
            value={mdp}
            onChange={(e) => { setMdp(e.target.value); setMdpErreur(false); }}
            placeholder="Mot de passe"
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:border-red-600"
          />
          {mdpErreur && <p className="text-red-500 text-xs mb-3">Mot de passe incorrect</p>}
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
            Entrer
          </button>
        </form>
      </div>
    );
  }

  const jobsFiltres = jobs.filter((j) => {
    if (filtreVille && !j.ville.toLowerCase().includes(filtreVille.toLowerCase())) return false;
    if (filtreDate && j.date !== filtreDate) return false;
    return true;
  });

  const villes = [...new Set(jobs.map((j) => j.ville))].sort();
  const grouped = groupByDate(jobsFiltres);
  const dates = Object.keys(grouped).sort();

  // Jobs non-complétés pour le mode itinéraire
  const jobsPourItineraire = jobs.filter(j => j.statut !== "complete");
  const parVille = groupByVille(jobsPourItineraire);
  const villesItineraire = Object.keys(parVille).sort();

  const formulaire = (
    <form onSubmit={ajouterJob} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
      <h2 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wide">Nouveau job</h2>
      <input required value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} placeholder="Nom du client *" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
      <div className="grid grid-cols-2 gap-2">
        <input required value={form.telephone} onChange={e => setForm(f => ({...f, telephone: e.target.value}))} placeholder="Téléphone *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
        <input required value={form.ville} onChange={e => setForm(f => ({...f, ville: e.target.value}))} placeholder="Ville *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
      </div>
      <div className="relative">
        <input
          required
          value={form.adresse}
          onChange={e => rechercherAdresse(e.target.value)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Adresse *"
          autoComplete="off"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
        />
        {showSuggestions && (
          <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => choisirSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-700 transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="font-medium">{s.adresse}</span>
                  {s.ville && <span className="text-gray-400 ml-1">— {s.ville}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Date *</label>
          <input required type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Heure</label>
          <input type="time" value={form.heure} onChange={e => setForm(f => ({...f, heure: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
        </div>
      </div>
      <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Notes (optionnel)" rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 resize-none" />
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm hover:text-gray-600 px-2">
          Annuler
        </button>
      </div>
    </form>
  );

  // ─── MODE ITINÉRAIRE ────────────────────────────────────────────────────────
  if (modeItineraire) {
    const nbSelectionnes = selectionIds.size;

    return (
      <div className="flex-1 bg-[#f5f5f5] flex flex-col">
        {/* Barre itinéraire */}
        <div className="bg-[#1a1a1a] border-b border-white/10 px-4 py-3 shrink-0">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={() => setModeItineraire(false)}
              className="text-white/60 hover:text-white text-sm flex items-center gap-1"
            >
              ← Retour
            </button>
            <p className="text-white font-bold text-sm">
              {nbSelectionnes === 0 ? "Sélectionner des jobs" : `${nbSelectionnes} job${nbSelectionnes > 1 ? "s" : ""} sélectionné${nbSelectionnes > 1 ? "s" : ""}`}
            </p>
            <button
              onClick={genererItineraire}
              disabled={nbSelectionnes === 0 || optimisant}
              className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-40"
            >
              {optimisant ? "Optimisation..." : "🗺️ Ouvrir Maps"}
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
          <p className="text-xs text-gray-400 text-center">Coche les jobs à inclure dans ton itinéraire, puis clique «&nbsp;Ouvrir Maps&nbsp;»</p>

          {villesItineraire.length === 0 ? (
            <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-200">
              Aucun job à faire
            </div>
          ) : (
            villesItineraire.map(ville => {
              const villeJobs = parVille[ville];
              const tousCoches = villeJobs.every(j => selectionIds.has(j.id));
              const aucunCoche = villeJobs.every(j => !selectionIds.has(j.id));

              return (
                <div key={ville} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* En-tête ville */}
                  <button
                    onClick={() => toggleVille(villeJobs)}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        tousCoches ? "bg-red-600 border-red-600" : aucunCoche ? "border-gray-300" : "bg-red-100 border-red-400"
                      }`}>
                        {!aucunCoche && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            {tousCoches
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            }
                          </svg>
                        )}
                      </div>
                      <span className="font-bold text-[#1a1a1a]">{ville}</span>
                    </div>
                    <span className="text-sm text-gray-400">{villeJobs.filter(j => selectionIds.has(j.id)).length}/{villeJobs.length}</span>
                  </button>

                  {/* Jobs de cette ville */}
                  {villeJobs.map(job => (
                    <button
                      key={job.id}
                      onClick={() => toggleSelection(job.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left ${
                        selectionIds.has(job.id) ? "bg-red-50/50" : ""
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                        selectionIds.has(job.id) ? "bg-red-600 border-red-600" : "border-gray-300"
                      }`}>
                        {selectionIds.has(job.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a]">{job.nom}</p>
                        <p className="text-xs text-gray-400 truncate">{job.adresse}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">{formatDate(job.date)}</p>
                        {job.heure && <p className="text-xs font-medium text-gray-500">{job.heure.slice(0, 5)}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })
          )}

          {nbSelectionnes > 0 && (
            <button
              onClick={genererItineraire}
              disabled={optimisant}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-red-700 transition-colors shadow disabled:opacity-60"
            >
              {optimisant
                ? `⏳ Optimisation en cours... (${nbSelectionnes} adresses)`
                : `🗺️ Générer itinéraire optimisé — ${nbSelectionnes} arrêt${nbSelectionnes > 1 ? "s" : ""}`
              }
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── MODE NORMAL ────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-[#f5f5f5] flex flex-col">

      {/* Barre d'actions */}
      <div className="bg-[#1a1a1a]/80 border-b border-white/10 px-4 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <p className="text-white/50 text-xs">
            {jobs.filter(j => j.statut === "a_faire").length} à faire ·{" "}
            {jobs.filter(j => j.statut === "en_cours").length} en cours ·{" "}
            {jobs.filter(j => j.statut === "complete").length} complétés
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={entrerModeItineraire}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              🗺️ Itinéraire
            </button>
            <button
              onClick={() => setShowFiltres(!showFiltres)}
              className={`md:hidden text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                (filtreDate || filtreVille) ? "bg-red-600 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              Filtres {(filtreDate || filtreVille) ? "●" : ""}
            </button>
            <button
              onClick={ouvrirFormulaire}
              className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              + Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire mobile */}
      {showForm && (
        <div className="md:hidden px-4 pt-4">
          {formulaire}
        </div>
      )}

      {/* Filtres mobile */}
      {showFiltres && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex gap-2">
          <input
            type="date"
            value={filtreDate}
            onChange={e => setFiltreDate(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
          />
          <select
            value={filtreVille}
            onChange={e => setFiltreVille(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
          >
            <option value="">Toutes les villes</option>
            {villes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {(filtreDate || filtreVille) && (
            <button onClick={() => { setFiltreDate(""); setFiltreVille(""); }} className="text-red-600 text-sm font-bold px-2">✕</button>
          )}
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-6 md:flex md:gap-6">

        {/* Sidebar desktop */}
        <aside className="hidden md:block md:w-72 lg:w-80 shrink-0 space-y-4 md:sticky md:top-6 md:self-start">
          {showForm && formulaire}

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
            <h2 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wide">Filtres</h2>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Date</label>
              <input
                type="date"
                value={filtreDate}
                onChange={e => setFiltreDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Ville</label>
              <select
                value={filtreVille}
                onChange={e => setFiltreVille(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
              >
                <option value="">Toutes les villes</option>
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {(filtreDate || filtreVille) && (
              <button onClick={() => { setFiltreDate(""); setFiltreVille(""); }} className="text-red-600 text-sm font-semibold hover:underline">
                Effacer les filtres
              </button>
            )}
          </div>
        </aside>

        {/* Liste des jobs */}
        <main className="flex-1 space-y-5">
          {loading ? (
            <div className="text-center text-gray-400 py-16">Chargement...</div>
          ) : dates.length === 0 ? (
            <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-lg mb-2">Aucun job</p>
              <p className="text-sm">Clique sur &quot;+ Ajouter&quot; pour créer un job</p>
            </div>
          ) : (
            dates.map((date) => (
              <div key={date}>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  {formatDate(date)}
                </h2>
                <div className="space-y-2">
                  {grouped[date].map((job) => (
                    <div key={job.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${job.statut === "complete" ? "opacity-40" : ""}`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-[#1a1a1a]">{job.nom}</span>
                            {job.heure && <span className="text-gray-400 text-sm font-medium shrink-0">{job.heure.slice(0, 5)}</span>}
                          </div>
                          <button
                            onClick={() => changerStatut(job)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ml-2 ${STATUT_COLORS[job.statut]}`}
                          >
                            {STATUT_LABELS[job.statut]}
                          </button>
                        </div>
                        <a
                          href={mapsUrl(job.adresse, job.ville)}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-2 group"
                        >
                          <span className="text-red-600 text-sm">📍</span>
                          <span className="text-red-700 text-sm font-medium">{job.adresse}, {job.ville}</span>
                          <span className="text-red-400 text-xs ml-auto group-hover:text-red-600">Maps →</span>
                        </a>
                        {job.notes && <p className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-2.5 py-1.5">{job.notes}</p>}
                      </div>
                      <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
                        <a href={`tel:${job.telephone}`} className="flex items-center justify-center gap-1.5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" /></svg>
                          Appeler
                        </a>
                        <button onClick={() => changerStatut(job)} className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Avancer
                        </button>
                        <button onClick={() => supprimerJob(job.id)} className="flex items-center justify-center gap-1.5 py-3 text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
