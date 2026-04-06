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

function itineraireUrl(jobs: Job[]) {
  const adresses = jobs
    .filter((j) => j.statut !== "complete")
    .map((j) => encodeURIComponent(`${j.adresse}, ${j.ville}, QC`));
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
  const [form, setForm] = useState({
    nom: "", telephone: "", adresse: "", ville: "", date: "", heure: "", notes: "",
  });
  const [suggestions, setSuggestions] = useState<Array<{adresse: string; ville: string; label: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setForm((f) => ({ ...f, ...data }));
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

  async function ajouterJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ nom: "", telephone: "", adresse: "", ville: "", date: "", heure: "", notes: "" });
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
      } catch { /* ignore network errors */ }
    }, 400);
  }

  function choisirSuggestion(s: { adresse: string; ville: string }) {
    setForm(f => ({ ...f, adresse: s.adresse, ville: s.ville }));
    setSuggestions([]);
    setShowSuggestions(false);
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
  const jobsAFaire = jobsFiltres.filter((j) => j.statut !== "complete");
  const urlItineraire = filtreDate
    ? itineraireUrl(jobsFiltres.filter((j) => j.date === filtreDate))
    : itineraireUrl(jobsAFaire);

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
        <input required type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
        <input type="time" value={form.heure} onChange={e => setForm(f => ({...f, heure: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600" />
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

  return (
    <div className="flex-1 bg-[#f5f5f5] flex flex-col">

      {/* Barre d'actions — visible partout */}
      <div className="bg-[#1a1a1a]/80 border-b border-white/10 px-4 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <p className="text-white/50 text-xs">
            {jobs.filter(j => j.statut === "a_faire").length} à faire ·{" "}
            {jobs.filter(j => j.statut === "en_cours").length} en cours ·{" "}
            {jobs.filter(j => j.statut === "complete").length} complétés
          </p>
          <div className="flex items-center gap-2">
            {/* Filtres mobile toggle */}
            <button
              onClick={() => setShowFiltres(!showFiltres)}
              className={`md:hidden text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                (filtreDate || filtreVille) ? "bg-red-600 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              Filtres {(filtreDate || filtreVille) ? "●" : ""}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              + Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire mobile (plein écran) */}
      {showForm && (
        <div className="md:hidden px-4 pt-4">
          {formulaire}
        </div>
      )}

      {/* Filtres mobile dépliables */}
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

      {/* Itinéraire mobile */}
      {urlItineraire && (
        <div className="md:hidden px-4 pt-3">
          <a
            href={urlItineraire}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-red-700 transition-colors text-sm w-full"
          >
            🗺️ Itinéraire Google Maps ({jobsAFaire.length} adresses)
          </a>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-6 md:flex md:gap-6">

        {/* Sidebar desktop uniquement */}
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

          {urlItineraire && (
            <a
              href={urlItineraire}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-red-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm w-full justify-center text-sm"
            >
              🗺️ Itinéraire Google Maps ({jobsAFaire.length})
            </a>
          )}
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
                      {/* Infos */}
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
                      {/* Actions */}
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

