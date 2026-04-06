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
  montant: number | null;
}

const STATUT_LABELS: Record<Statut, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  complete: "Complété",
};

const STATUT_COLORS: Record<Statut, string> = {
  a_faire: "bg-red-500/15 text-red-400 border-red-500/30",
  en_cours: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  complete: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
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

async function nominatimQuery(q: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=ca`,
      { headers: { "Accept-Language": "fr" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch { return null; }
}

async function geocoderAdresse(adresse: string, ville: string): Promise<{ lat: number; lon: number } | null> {
  const delay = () => new Promise(r => setTimeout(r, 1100));
  const r1 = await nominatimQuery(`${adresse}, ${ville}, Quebec, Canada`);
  if (r1) return r1;
  await delay();
  const rueSansNum = adresse.replace(/^\d+\s*/, "").trim();
  if (rueSansNum && rueSansNum !== adresse) {
    const r2 = await nominatimQuery(`${rueSansNum}, ${ville}, Quebec, Canada`);
    if (r2) return r2;
    await delay();
  }
  const r3 = await nominatimQuery(`${ville}, Quebec, Canada`);
  await delay();
  return r3;
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function longueurTotale(route: Array<{ lat: number; lon: number }>, depart: { lat: number; lon: number }) {
  let total = distanceKm(depart, route[0]);
  for (let i = 0; i < route.length - 1; i++) total += distanceKm(route[i], route[i + 1]);
  return total;
}

function deuxOpt<T extends { lat: number; lon: number }>(route: T[], depart: { lat: number; lon: number }): T[] {
  if (route.length <= 2) return route;
  let best = [...route];
  let ameliore = true;
  while (ameliore) {
    ameliore = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 2; j < best.length; j++) {
        const avant = i === 0 ? depart : best[i - 1];
        const dActuel = distanceKm(avant, best[i]) + distanceKm(best[j - 1], best[j]);
        const dInverse = distanceKm(avant, best[j - 1]) + distanceKm(best[i], best[j]);
        if (dInverse < dActuel - 0.01) {
          const nouveau = [...best];
          nouveau.splice(i, j - i, ...best.slice(i, j).reverse());
          best = nouveau;
          ameliore = true;
        }
      }
    }
  }
  return best;
}

function nowDateStr() { return new Date().toISOString().split("T")[0]; }
function nowHeureStr() { return new Date().toTimeString().slice(0, 5); }

const FORM_VIDE = { nom: "", telephone: "", adresse: "", ville: "", date: "", heure: "", notes: "", montant: "" };

// Composant autocomplete réutilisable
function AdresseAutocomplete({ value, onChange, onSelect, placeholder = "Adresse", required = false }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (adresse: string, ville: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [sugg, setSugg] = useState<Array<{ adresse: string; ville: string; label: string }>>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(q: string) {
    onChange(q);
    if (ref.current) clearTimeout(ref.current);
    if (q.length < 4) { setSugg([]); setOpen(false); return; }
    ref.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", Quebec, Canada")}&format=json&addressdetails=1&limit=6&countrycodes=ca`,
          { headers: { "Accept-Language": "fr" } }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = await res.json();
        const results = data.filter(r => r.address?.road).map(r => {
          const num = r.address.house_number ?? "";
          const rue = r.address.road ?? "";
          const ville = r.address.city ?? r.address.town ?? r.address.village ?? r.address.municipality ?? "";
          const adresse = `${num} ${rue}`.trim();
          return { adresse, ville, label: [adresse, ville].filter(Boolean).join(", ") };
        }).filter(r => r.adresse && r.ville);
        setSugg(results);
        setOpen(results.length > 0);
      } catch { /* ignore */ }
    }, 400);
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => sugg.length > 0 && setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all"
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#13131a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
          {sugg.map((s, i) => (
            <li key={i}>
              <button type="button" onMouseDown={() => { onSelect(s.adresse, s.ville); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-500/10 hover:text-red-400 transition-colors border-b border-white/[0.04] last:border-0">
                <span className="font-medium">{s.adresse}</span>
                {s.ville && <span className="text-gray-400 ml-1">— {s.ville}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
  const [form, setForm] = useState(FORM_VIDE);

  // Édition job
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [editJobForm, setEditJobForm] = useState(FORM_VIDE);
  const [savingEdit, setSavingEdit] = useState(false);

  // Mode itinéraire
  const [modeItineraire, setModeItineraire] = useState(false);
  const [selectionIds, setSelectionIds] = useState<Set<string>>(new Set());
  const [optimisant, setOptimisant] = useState(false);
  const [destination, setDestination] = useState("");
  const [suggestionsDestination, setSuggestionsDestination] = useState<Array<{ label: string; adresse: string; ville: string; lat: number; lon: number }>>([]);
  const [showSuggestionsDestination, setShowSuggestionsDestination] = useState(false);
  const [destinationChoisie, setDestinationChoisie] = useState<{ adresse: string; ville: string; lat: number; lon: number } | null>(null);
  const debounceDestRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuth(true);
  }, []);

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

  useEffect(() => { if (auth) fetchJobs(); }, [auth, fetchJobs]);

  function soumettreMdp(e: React.FormEvent) {
    e.preventDefault();
    if (mdp === MOT_DE_PASSE) { sessionStorage.setItem("dicter_auth", mdp); setAuth(true); }
    else setMdpErreur(true);
  }

  function ouvrirFormulaire() {
    setForm(f => ({ ...f, date: f.date || nowDateStr(), heure: f.heure || nowHeureStr() }));
    setShowForm(true);
  }

  async function ajouterJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, montant: form.montant ? parseFloat(form.montant) : null };
    await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setForm(FORM_VIDE);
    setShowForm(false);
    await fetchJobs();
    setSaving(false);
  }

  const [lienCopie, setLienCopie] = useState<string | null>(null);

  async function changerStatut(job: Job) {
    const next = STATUT_NEXT[job.statut];
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, statut: next } : j));
    await fetch(`/api/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut: next }) });
  }

  async function copierLienAvis(jobId: string) {
    const url = "https://g.page/r/CT-AI6_v4mdPEAI/review";
    await navigator.clipboard.writeText(url);
    setLienCopie(jobId);
    setTimeout(() => setLienCopie(null), 2000);
  }

  async function supprimerJob(id: string) {
    if (!confirm("Supprimer ce job?")) return;
    setJobs(prev => prev.filter(j => j.id !== id));
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
  }

  function ouvrirEditJob(job: Job) {
    setEditJobId(job.id);
    setEditJobForm({ nom: job.nom, telephone: job.telephone, adresse: job.adresse, ville: job.ville, date: job.date, heure: job.heure ?? "", notes: job.notes ?? "", montant: job.montant != null ? String(job.montant) : "" });
  }

  async function sauvegarderEditJob(job: Job) {
    setSavingEdit(true);
    const payload = { nom: editJobForm.nom, telephone: editJobForm.telephone, adresse: editJobForm.adresse, ville: editJobForm.ville, date: editJobForm.date, heure: editJobForm.heure || null, notes: editJobForm.notes || null, montant: editJobForm.montant ? parseFloat(editJobForm.montant) : null };
    await fetch(`/api/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, ...payload } as Job : j));
    setEditJobId(null);
    setSavingEdit(false);
  }

  // Itinéraire
  function rechercherDestination(query: string) {
    setDestination(query);
    setDestinationChoisie(null);
    if (debounceDestRef.current) clearTimeout(debounceDestRef.current);
    if (query.length < 3) { setSuggestionsDestination([]); setShowSuggestionsDestination(false); return; }
    debounceDestRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Quebec, Canada")}&format=json&addressdetails=1&limit=5&countrycodes=ca`,
          { headers: { "Accept-Language": "fr" } }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = await res.json();
        const results = data.map(r => {
          const num = r.address?.house_number ?? "";
          const rue = r.address?.road ?? "";
          const ville = r.address?.city ?? r.address?.town ?? r.address?.village ?? r.address?.municipality ?? r.address?.county ?? "";
          const adresse = rue ? `${num} ${rue}`.trim() : ville;
          // FIX: utiliser les champs d'adresse, pas display_name (évite "Mont-Plaisant")
          const label = [adresse, ville].filter(Boolean).join(", ");
          return { label, adresse, ville, lat: parseFloat(r.lat), lon: parseFloat(r.lon) };
        }).filter(r => r.ville);
        setSuggestionsDestination(results);
        setShowSuggestionsDestination(results.length > 0);
      } catch { /* ignore */ }
    }, 400);
  }

  function toggleSelection(id: string) {
    setSelectionIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleVille(villeJobs: Job[]) {
    const ids = villeJobs.map(j => j.id);
    const tousCoches = ids.every(id => selectionIds.has(id));
    setSelectionIds(prev => { const next = new Set(prev); if (tousCoches) ids.forEach(id => next.delete(id)); else ids.forEach(id => next.add(id)); return next; });
  }

  function entrerModeItineraire() {
    const aujourd_hui = nowDateStr();
    const ids = jobs.filter(j => j.statut !== "complete" && j.date === aujourd_hui).map(j => j.id);
    setSelectionIds(new Set(ids));
    setDestination("");
    setDestinationChoisie(null);
    setModeItineraire(true);
  }

  async function genererItineraire() {
    const jobsSelectionnes = jobs.filter(j => selectionIds.has(j.id));
    if (jobsSelectionnes.length === 0) return;
    setOptimisant(true);
    try {
      let positionActuelle: { lat: number; lon: number } | null = null;
      try {
        positionActuelle = await new Promise(resolve => {
          if (!navigator.geolocation) { resolve(null); return; }
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 5000, maximumAge: 60000 }
          );
        });
      } catch { /* GPS non disponible */ }

      const coordonnees: Array<{ lat: number; lon: number } | null> = [];
      for (const j of jobsSelectionnes) {
        coordonnees.push(await geocoderAdresse(j.adresse, j.ville));
      }

      const avecCoords = jobsSelectionnes.map((j, i) => ({ ...j, ...(coordonnees[i] ?? { lat: 0, lon: 0 }) })).filter(j => j.lat !== 0);
      const sansCoords = jobsSelectionnes.filter((_, i) => !coordonnees[i]);

      const pointDepart = positionActuelle ?? (avecCoords[0] ?? null);
      let optimises: typeof avecCoords;
      if (pointDepart && avecCoords.length > 1) {
        const restants = [...avecCoords];
        optimises = [];
        let courant = pointDepart;
        while (restants.length > 0) {
          let idx = 0, minDist = Infinity;
          for (let i = 0; i < restants.length; i++) { const d = distanceKm(courant, restants[i]); if (d < minDist) { minDist = d; idx = i; } }
          const suivant = restants.splice(idx, 1)[0];
          optimises.push(suivant);
          courant = suivant;
        }
        const avant = longueurTotale(optimises, pointDepart);
        optimises = deuxOpt(optimises, pointDepart);
        console.log(`Optimisation : ${avant.toFixed(1)} km → ${longueurTotale(optimises, pointDepart).toFixed(1)} km`);
      } else {
        optimises = avecCoords;
      }

      const tousEnOrdre = [...optimises, ...sansCoords];
      const stops = tousEnOrdre.map(j => encodeURIComponent(`${j.adresse}, ${j.ville}, QC`));
      if (destinationChoisie) stops.push(`${destinationChoisie.lat},${destinationChoisie.lon}`);
      else if (destination.trim()) stops.push(encodeURIComponent(`${destination.trim()}, QC, Canada`));

      let url: string;
      if (positionActuelle) url = `https://www.google.com/maps/dir/${positionActuelle.lat},${positionActuelle.lon}/${stops.join("/")}`;
      else url = itineraireUrl(stops) ?? "";
      if (url) window.open(url, "_blank");
    } finally { setOptimisant(false); }
  }

  if (!auth) {
    return (
      <div className="flex-1 bg-[#0b0b10] flex items-center justify-center px-4">
        <form onSubmit={soumettreMdp} className="bg-[#13131a] border border-white/[0.06] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <p className="text-white/25 text-xs text-center mb-2 uppercase tracking-[0.15em]">Experts Portes de Garage</p>
          <h1 className="text-xl font-bold text-white mb-6 text-center">Espace admin</h1>
          <input type="password" value={mdp} onChange={e => { setMdp(e.target.value); setMdpErreur(false); }} placeholder="Mot de passe" autoFocus className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm mb-3 focus:outline-none focus:border-red-500/50 transition-all" />
          {mdpErreur && <p className="text-red-400 text-xs mb-3">Mot de passe incorrect</p>}
          <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3.5 rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/20">Entrer</button>
        </form>
      </div>
    );
  }

  // Calcul revenus
  const debutMois = new Date(); debutMois.setDate(1); const moisStr = debutMois.toISOString().split("T")[0];
  const debutSemaine = new Date(); debutSemaine.setDate(debutSemaine.getDate() - debutSemaine.getDay()); const semStr = debutSemaine.toISOString().split("T")[0];
  const revenuMois = jobs.filter(j => j.statut === "complete" && j.montant && j.date >= moisStr).reduce((s, j) => s + (j.montant ?? 0), 0);
  const revenuSemaine = jobs.filter(j => j.statut === "complete" && j.montant && j.date >= semStr).reduce((s, j) => s + (j.montant ?? 0), 0);
  const formatMontant = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  const jobsFiltres = jobs.filter(j => {
    if (filtreVille && !j.ville.toLowerCase().includes(filtreVille.toLowerCase())) return false;
    if (filtreDate && j.date !== filtreDate) return false;
    return true;
  });

  const villes = [...new Set(jobs.map(j => j.ville))].sort();
  const grouped = groupByDate(jobsFiltres);
  const dates = Object.keys(grouped).sort();
  const jobsPourItineraire = jobs.filter(j => j.statut !== "complete");
  const parVille = groupByVille(jobsPourItineraire);
  const villesItineraire = Object.keys(parVille).sort();
  const nbSelectionnes = selectionIds.size;
  const aujourdhui = nowDateStr();

  const formulaire = (
    <form onSubmit={ajouterJob} className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] space-y-3">
      <h2 className="font-bold text-white text-sm uppercase tracking-wide">Nouveau job</h2>
      <input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom du client *" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
      <div className="grid grid-cols-2 gap-2">
        <input required value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="Téléphone *" className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
        <input required value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} placeholder="Ville *" className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
      </div>
      <AdresseAutocomplete value={form.adresse} onChange={v => setForm(f => ({ ...f, adresse: v }))} onSelect={(a, v) => setForm(f => ({ ...f, adresse: a, ville: v }))} placeholder="Adresse *" required />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-white/30 block mb-1">Date *</label>
          <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="admin-input w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
        </div>
        <div>
          <label className="text-xs text-white/30 block mb-1">Heure</label>
          <input type="time" value={form.heure} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))} className="admin-input w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optionnel)" rows={2} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 resize-none transition-all" />
        <div>
          <label className="text-xs text-white/30 block mb-1">Montant ($)</label>
          <input type="number" min="0" step="0.01" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} placeholder="ex: 150.00" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:from-red-500 hover:to-red-400 active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="text-white/30 text-sm hover:text-white/60 px-2 transition-colors">Annuler</button>
      </div>
    </form>
  );

  // ─── MODE ITINÉRAIRE ────────────────────────────────────────────────────────
  if (modeItineraire) {
    return (
      <div className="flex-1 bg-[#0b0b10] flex flex-col">
        <div className="bg-[#1a1a1a] border-b border-white/10 px-4 py-3 shrink-0">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <button onClick={() => setModeItineraire(false)} className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors">← Retour</button>
            <p className="text-white font-bold text-sm">
              {nbSelectionnes === 0 ? "Sélectionner des jobs" : `${nbSelectionnes} job${nbSelectionnes > 1 ? "s" : ""} sélectionné${nbSelectionnes > 1 ? "s" : ""}`}
            </p>
            <button onClick={genererItineraire} disabled={nbSelectionnes === 0 || optimisant} className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-700 active:scale-95 transition-all disabled:opacity-40">
              {optimisant ? "⏳..." : "🗺️ Maps"}
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
          <p className="text-xs text-white/30 text-center">Coche les jobs à inclure, puis clique «&nbsp;Maps&nbsp;»</p>

          {/* Destination finale */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Terminer à (optionnel)</label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={e => rechercherDestination(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestionsDestination(false), 150)}
                onFocus={() => suggestionsDestination.length > 0 && setShowSuggestionsDestination(true)}
                placeholder="ex: Ange-Gardien, maison, bureau..."
                autoComplete="off"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all"
              />
              {destinationChoisie && (
                <button type="button" onClick={() => { setDestination(""); setDestinationChoisie(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg transition-colors">×</button>
              )}
              {showSuggestionsDestination && (
                <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#13131a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
                  {suggestionsDestination.map((s, i) => (
                    <li key={i}>
                      <button type="button" onMouseDown={() => { setDestination(s.label); setDestinationChoisie({ adresse: s.adresse, ville: s.ville, lat: s.lat, lon: s.lon }); setShowSuggestionsDestination(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 hover:text-red-400 transition-colors border-b border-white/[0.04] last:border-0">
                        📍 {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {destinationChoisie && <p className="text-xs text-emerald-400 mt-1.5 font-medium">✓ Destination confirmée — {destinationChoisie.adresse}, {destinationChoisie.ville}</p>}
          </div>

          {villesItineraire.length === 0 ? (
            <div className="text-center text-white/30 py-16 bg-white/[0.03] rounded-2xl border border-white/[0.06]">Aucun job à faire</div>
          ) : (
            villesItineraire.map(ville => {
              const villeJobs = parVille[ville];
              const tousCoches = villeJobs.every(j => selectionIds.has(j.id));
              const aucunCoche = villeJobs.every(j => !selectionIds.has(j.id));
              return (
                <div key={ville} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                  <button onClick={() => toggleVille(villeJobs)} className="w-full flex items-center justify-between px-4 py-3 border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${tousCoches ? "bg-red-600 border-red-600" : aucunCoche ? "border-white/20" : "bg-red-100 border-red-400"}`}>
                        {!aucunCoche && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>{tousCoches ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />}</svg>}
                      </div>
                      <span className="font-bold text-white">{ville}</span>
                    </div>
                    <span className="text-sm text-gray-400">{villeJobs.filter(j => selectionIds.has(j.id)).length}/{villeJobs.length}</span>
                  </button>
                  {villeJobs.map(job => (
                    <button key={job.id} onClick={() => toggleSelection(job.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors text-left ${selectionIds.has(job.id) ? "bg-red-500/5" : ""}`}>
                      <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${selectionIds.has(job.id) ? "bg-red-600 border-red-600" : "border-white/20"}`}>
                        {selectionIds.has(job.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/90">{job.nom}</p>
                        <p className="text-xs text-white/30 truncate">{job.adresse}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-white/30">{formatDate(job.date)}</p>
                        {job.heure && <p className="text-xs font-medium text-white/50">{job.heure.slice(0, 5)}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })
          )}

          {nbSelectionnes > 0 && (
            <button onClick={genererItineraire} disabled={optimisant}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-red-700 active:scale-[0.98] transition-all shadow disabled:opacity-60">
              {optimisant ? `⏳ Optimisation... (${nbSelectionnes} adresses)` : `🗺️ Générer itinéraire optimisé — ${nbSelectionnes} arrêt${nbSelectionnes > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── MODE NORMAL ────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-[#0b0b10] flex flex-col">

      {/* Barre d'actions */}
      <div className="bg-[#0b0b10]/95 backdrop-blur-sm border-b border-white/10 px-4 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <p className="text-white/50 text-xs">
            {jobs.filter(j => j.statut === "a_faire").length} à faire ·{" "}
            {jobs.filter(j => j.statut === "en_cours").length} en cours
          </p>
          <div className="flex items-center gap-2">
            <button onClick={entrerModeItineraire} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white active:scale-95 transition-all">
              🗺️ Itinéraire
            </button>
            <button onClick={() => setShowFiltres(!showFiltres)}
              className={`md:hidden text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${(filtreDate || filtreVille) ? "bg-red-600 text-white" : "bg-white/10 text-white/70"}`}>
              Filtres {(filtreDate || filtreVille) ? "●" : ""}
            </button>
            <button onClick={ouvrirFormulaire} className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 active:scale-95 transition-all">
              + Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Barre revenus */}
      {(revenuMois > 0 || revenuSemaine > 0) && (
        <div className="bg-[#0b0b10] border-b border-white/5 px-4 py-2 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">Cette semaine</span>
              <span className="text-green-400 font-bold text-sm">{formatMontant(revenuSemaine)}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">Ce mois</span>
              <span className="text-green-400 font-bold text-sm">{formatMontant(revenuMois)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtres rapides — date aujourd'hui + villes */}
      <div className="bg-white/[0.02] border-b border-white/10 px-4 py-2.5 overflow-x-auto shrink-0 hidden md:block">
        <div className="flex gap-2 min-w-max max-w-7xl mx-auto">
          <button onClick={() => { setFiltreDate(""); setFiltreVille(""); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${!filtreDate && !filtreVille ? "bg-red-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}>
            Tous
          </button>
          <button onClick={() => setFiltreDate(filtreDate === aujourdhui ? "" : aujourdhui)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${filtreDate === aujourdhui ? "bg-red-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}>
            Aujourd&apos;hui
          </button>
          {villes.map(v => (
            <button key={v} onClick={() => setFiltreVille(filtreVille === v ? "" : v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${filtreVille === v ? "bg-red-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire mobile */}
      {showForm && <div className="md:hidden px-4 pt-4">{formulaire}</div>}

      {/* Filtres mobile */}
      {showFiltres && (
        <div className="md:hidden bg-white/[0.04] border-b border-white/[0.06] px-4 py-3 flex gap-2">
          <input type="date" value={filtreDate} onChange={e => setFiltreDate(e.target.value)} className="admin-input flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all" />
          <select value={filtreVille} onChange={e => setFiltreVille(e.target.value)} className="admin-input flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all">
            <option value="">Toutes les villes</option>
            {villes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {(filtreDate || filtreVille) && <button onClick={() => { setFiltreDate(""); setFiltreVille(""); }} className="text-red-400 text-sm font-bold px-2">✕</button>}
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-6 md:flex md:gap-6">

        {/* Sidebar desktop */}
        <aside className="hidden md:block md:w-72 lg:w-80 shrink-0 space-y-4 md:sticky md:top-6 md:self-start">
          {showForm && formulaire}
          <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] space-y-3">
            <h2 className="font-bold text-white text-sm uppercase tracking-wide">Filtres</h2>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wide mb-1 block">Date</label>
              <input type="date" value={filtreDate} onChange={e => setFiltreDate(e.target.value)} className="admin-input w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all" />
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wide mb-1 block">Ville</label>
              <select value={filtreVille} onChange={e => setFiltreVille(e.target.value)} className="admin-input w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all">
                <option value="">Toutes les villes</option>
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {(filtreDate || filtreVille) && (
              <button onClick={() => { setFiltreDate(""); setFiltreVille(""); }} className="text-red-400 text-sm font-semibold hover:underline transition-colors">Effacer les filtres</button>
            )}
          </div>
        </aside>

        {/* Liste des jobs */}
        <main className="flex-1 space-y-5">
          {loading ? (
            <div className="text-center text-white/30 py-16">Chargement...</div>
          ) : dates.length === 0 ? (
            <div className="text-center text-white/30 py-16 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
              <p className="text-lg mb-2">Aucun job</p>
              <p className="text-sm">Clique sur &quot;+ Ajouter&quot; pour créer un job</p>
            </div>
          ) : (
            dates.map(date => (
              <div key={date}>
                <h2 className="text-xs font-bold text-white/25 uppercase tracking-widest mb-2 px-1">{formatDate(date)}</h2>
                <div className="space-y-2">
                  {grouped[date].map(job => (
                    <div key={job.id} className={`bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-150 hover:bg-white/[0.06] ${job.statut === "complete" ? "opacity-40" : ""}`}>

                      {editJobId === job.id ? (
                        /* Formulaire édition */
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-white text-sm">Modifier — {job.nom}</h3>
                            <button onClick={() => setEditJobId(null)} className="text-white/30 hover:text-white/60 text-lg transition-colors">✕</button>
                          </div>
                          <input value={editJobForm.nom} onChange={e => setEditJobForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
                          <div className="grid grid-cols-2 gap-2">
                            <input value={editJobForm.telephone} onChange={e => setEditJobForm(f => ({ ...f, telephone: e.target.value }))} placeholder="Téléphone" className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
                            <input value={editJobForm.ville} onChange={e => setEditJobForm(f => ({ ...f, ville: e.target.value }))} placeholder="Ville" className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
                          </div>
                          <AdresseAutocomplete value={editJobForm.adresse} onChange={v => setEditJobForm(f => ({ ...f, adresse: v }))} onSelect={(a, v) => setEditJobForm(f => ({ ...f, adresse: a, ville: v }))} placeholder="Adresse" />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-white/30 block mb-1">Date</label>
                              <input type="date" value={editJobForm.date} onChange={e => setEditJobForm(f => ({ ...f, date: e.target.value }))} className="admin-input w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
                            </div>
                            <div>
                              <label className="text-xs text-white/30 block mb-1">Heure</label>
                              <input type="time" value={editJobForm.heure} onChange={e => setEditJobForm(f => ({ ...f, heure: e.target.value }))} className="admin-input w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <textarea value={editJobForm.notes} onChange={e => setEditJobForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" rows={2} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 resize-none transition-all" />
                            <div>
                              <label className="text-xs text-white/30 block mb-1">Montant ($)</label>
                              <input type="number" min="0" step="0.01" value={editJobForm.montant} onChange={e => setEditJobForm(f => ({ ...f, montant: e.target.value }))} placeholder="ex: 150.00" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all" />
                            </div>
                          </div>
                          <button onClick={() => sauvegarderEditJob(job)} disabled={savingEdit} className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:from-red-500 hover:to-red-400 active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
                            {savingEdit ? "Sauvegarde..." : "Sauvegarder"}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-white">{job.nom}</span>
                                {job.heure && <span className="text-white/40 text-sm font-medium shrink-0">{job.heure.slice(0, 5)}</span>}
                                {job.montant && <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">{formatMontant(job.montant)}</span>}
                              </div>
                              <button onClick={() => changerStatut(job)} className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ml-2 transition-all active:scale-95 ${STATUT_COLORS[job.statut]}`}>
                                {STATUT_LABELS[job.statut]}
                              </button>
                            </div>
                            <a href={mapsUrl(job.adresse, job.ville)} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-2 group hover:bg-red-500/15 transition-colors">
                              <span className="text-red-400 text-sm">📍</span>
                              <span className="text-red-300 text-sm font-medium">{job.adresse}, {job.ville}</span>
                              <span className="text-red-400/50 text-xs ml-auto group-hover:text-red-300 transition-colors">Maps →</span>
                            </a>
                            {job.notes && <p className="text-xs text-white/30 italic bg-white/[0.03] rounded-lg px-2.5 py-1.5">{job.notes}</p>}
                          </div>
                          {job.statut === "complete" && (
                            <div className="border-t border-white/[0.06] px-4 py-2.5">
                              <button
                                type="button"
                                onClick={() => copierLienAvis(job.id)}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                                  lienCopie === job.id
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                                }`}
                              >
                                {lienCopie === job.id ? "Lien copié!" : "Copier lien avis Google"}
                              </button>
                            </div>
                          )}
                          <div className="border-t border-white/[0.06] grid grid-cols-4 divide-x divide-white/[0.06]">
                            <a href={`tel:${job.telephone}`} className="flex items-center justify-center gap-1.5 py-3 text-sm text-white/40 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" /></svg>
                              Appeler
                            </a>
                            <button onClick={() => ouvrirEditJob(job)} className="flex items-center justify-center gap-1.5 py-3 text-sm text-white/40 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              Modifier
                            </button>
                            <button onClick={() => changerStatut(job)} className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Avancer
                            </button>
                            <button onClick={() => supprimerJob(job.id)} className="flex items-center justify-center gap-1.5 py-3 text-sm text-white/20 hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
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
