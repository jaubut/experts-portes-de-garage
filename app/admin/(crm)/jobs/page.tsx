"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const MOT_DE_PASSE = "l1a2m3B5";

type Statut = "a_faire" | "en_cours" | "complete";

interface CoutItem {
  description: string;
  montant: number;
  type: "materiel" | "main_oeuvre" | "sous_traitant";
}

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
  client_id: string | null;
  soumission_id: string | null;
  couts: CoutItem[] | null;
  temps_debut: string | null;
  temps_fin: string | null;
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

function longueurTotale(route: Array<{ lat: number; lon: number }>, depart: { lat: number; lon: number }, arrivee?: { lat: number; lon: number } | null) {
  if (route.length === 0) return 0;
  let total = distanceKm(depart, route[0]);
  for (let i = 0; i < route.length - 1; i++) total += distanceKm(route[i], route[i + 1]);
  if (arrivee) total += distanceKm(route[route.length - 1], arrivee);
  return total;
}

function deuxOpt<T extends { lat: number; lon: number }>(route: T[], depart: { lat: number; lon: number }, arrivee?: { lat: number; lon: number } | null): T[] {
  if (route.length <= 2) return route;
  let best = [...route];
  let bestCost = longueurTotale(best, depart, arrivee);
  let ameliore = true;
  while (ameliore) {
    ameliore = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 2; j <= best.length; j++) {
        const candidat = [...best];
        candidat.splice(i, j - i, ...best.slice(i, j).reverse());
        const cout = longueurTotale(candidat, depart, arrivee);
        if (cout < bestCost - 0.01) {
          best = candidat;
          bestCost = cout;
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

  // Job costing
  const [costingJobId, setCostingJobId] = useState<string | null>(null);
  const [newCout, setNewCout] = useState({ description: "", montant: "", type: "materiel" as CoutItem["type"] });

  // Mode itinéraire
  const [modeItineraire, setModeItineraire] = useState(false);
  const [selectionIds, setSelectionIds] = useState<Set<string>>(new Set());
  const [optimisant, setOptimisant] = useState(false);
  const [destination, setDestination] = useState("");
  const [suggestionsDestination, setSuggestionsDestination] = useState<Array<{ label: string; adresse: string; ville: string; lat: number; lon: number }>>([]);
  const [showSuggestionsDestination, setShowSuggestionsDestination] = useState(false);
  const [destinationChoisie, setDestinationChoisie] = useState<{ adresse: string; ville: string; lat: number; lon: number } | null>(null);
  const debounceDestRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Point de départ
  const [depart, setDepart] = useState("");
  const [suggestionsDepart, setSuggestionsDepart] = useState<Array<{ label: string; adresse: string; ville: string; lat: number; lon: number }>>([]);
  const [showSuggestionsDepart, setShowSuggestionsDepart] = useState(false);
  const [departChoisi, setDepartChoisi] = useState<{ adresse: string; ville: string; lat: number; lon: number } | null>(null);
  const debounceDepartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Priorités optionnelles
  const [priorites, setPriorites] = useState<Map<string, number>>(new Map());

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
    const res = await fetch("/api/jobs", { cache: "no-store" });
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
    const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { alert("Erreur lors de l'ajout du job"); setSaving(false); return; }
    setForm(FORM_VIDE);
    setShowForm(false);
    await fetchJobs();
    setSaving(false);
  }

  const [lienCopie, setLienCopie] = useState<string | null>(null);
  const [statutMenuOuvert, setStatutMenuOuvert] = useState<string | null>(null);

  // Fermer le menu statut quand on clique ailleurs
  useEffect(() => {
    if (!statutMenuOuvert) return;
    const handler = () => setStatutMenuOuvert(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [statutMenuOuvert]);

  async function changerStatut(job: Job, newStatut?: Statut) {
    const next = newStatut ?? STATUT_NEXT[job.statut];
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, statut: next } : j));
    const res = await fetch(`/api/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut: next }) });
    if (!res.ok) {
      alert("Erreur de sauvegarde du statut");
      await fetchJobs();
      return;
    }

    // Proposer de créer une facture quand job complété
    if (next === "complete" && job.montant) {
      const creer = confirm(`Job complété! Créer une facture de ${job.montant.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}?`);
      if (creer) {
        try {
          await fetch("/api/admin/factures", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              job_id: job.id,
              client_id: job.client_id ?? null,
              soumission_id: job.soumission_id ?? null,
              nom: job.nom,
              telephone: job.telephone,
              adresse: job.adresse,
              ville: job.ville,
              description: job.notes || null,
              montant: job.montant,
              statut: "brouillon",
            }),
          });
        } catch { /* ignore */ }
      }
    }
  }

  async function copierLienAvis(jobId: string) {
    const url = "https://g.page/r/CT-AI6_v4mdPEAI/review";
    await navigator.clipboard.writeText(url);
    setLienCopie(jobId);
    setTimeout(() => setLienCopie(null), 2000);
  }

  async function ajouterCout(job: Job) {
    if (!newCout.description || !newCout.montant) return;
    const couts = [...(job.couts || []), { description: newCout.description, montant: parseFloat(newCout.montant), type: newCout.type }];
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couts }),
      });
      setNewCout({ description: "", montant: "", type: "materiel" });
      fetchJobs();
    } catch { /* ignore */ }
  }

  async function supprimerCout(job: Job, idx: number) {
    const couts = (job.couts || []).filter((_, i) => i !== idx);
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couts }),
      });
      fetchJobs();
    } catch { /* ignore */ }
  }

  async function toggleTimer(job: Job) {
    const now = new Date().toISOString();
    const updates = job.temps_debut && !job.temps_fin
      ? { temps_fin: now }
      : { temps_debut: now, temps_fin: null };
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      fetchJobs();
    } catch { /* ignore */ }
  }

  async function supprimerJob(id: string) {
    if (!confirm("Supprimer ce job?")) return;
    setJobs(prev => prev.filter(j => j.id !== id));
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Erreur de suppression");
      await fetchJobs();
    }
  }

  function ouvrirEditJob(job: Job) {
    setEditJobId(job.id);
    setEditJobForm({ nom: job.nom, telephone: job.telephone, adresse: job.adresse, ville: job.ville, date: job.date, heure: job.heure ?? "", notes: job.notes ?? "", montant: job.montant != null ? String(job.montant) : "" });
  }

  async function sauvegarderEditJob(job: Job) {
    setSavingEdit(true);
    const payload = { nom: editJobForm.nom, telephone: editJobForm.telephone, adresse: editJobForm.adresse, ville: editJobForm.ville, date: editJobForm.date, heure: editJobForm.heure || null, notes: editJobForm.notes || null, montant: editJobForm.montant ? parseFloat(editJobForm.montant) : null };
    const res = await fetch(`/api/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      alert("Erreur de sauvegarde — les modifications n'ont pas été enregistrées");
      setSavingEdit(false);
      return;
    }
    const saved: Job = await res.json();
    setJobs(prev => prev.map(j => j.id === job.id ? saved : j));
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

  function rechercherDepart(query: string) {
    setDepart(query);
    setDepartChoisi(null);
    if (debounceDepartRef.current) clearTimeout(debounceDepartRef.current);
    if (query.length < 3) { setSuggestionsDepart([]); setShowSuggestionsDepart(false); return; }
    debounceDepartRef.current = setTimeout(async () => {
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
          const label = [adresse, ville].filter(Boolean).join(", ");
          return { label, adresse, ville, lat: parseFloat(r.lat), lon: parseFloat(r.lon) };
        }).filter(r => r.ville);
        setSuggestionsDepart(results);
        setShowSuggestionsDepart(results.length > 0);
      } catch { /* ignore */ }
    }, 400);
  }

  function toggleSelection(id: string) {
    setSelectionIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    setPriorites(prev => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      const sorted = [...next.entries()].sort((a, b) => a[1] - b[1]);
      next.clear();
      sorted.forEach(([k], i) => next.set(k, i + 1));
      return next;
    });
  }

  function toggleVille(villeJobs: Job[]) {
    const ids = villeJobs.map(j => j.id);
    const tousCoches = ids.every(id => selectionIds.has(id));
    setSelectionIds(prev => { const next = new Set(prev); if (tousCoches) ids.forEach(id => next.delete(id)); else ids.forEach(id => next.add(id)); return next; });
    if (tousCoches) {
      setPriorites(prev => {
        const next = new Map(prev);
        ids.forEach(id => next.delete(id));
        const sorted = [...next.entries()].sort((a, b) => a[1] - b[1]);
        next.clear();
        sorted.forEach(([k], i) => next.set(k, i + 1));
        return next;
      });
    }
  }

  function togglePriorite(jobId: string) {
    setPriorites(prev => {
      const next = new Map(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        const sorted = [...next.entries()].sort((a, b) => a[1] - b[1]);
        next.clear();
        sorted.forEach(([k], i) => next.set(k, i + 1));
      } else {
        next.set(jobId, next.size + 1);
      }
      return next;
    });
  }

  function entrerModeItineraire() {
    const aujourd_hui = nowDateStr();
    const ids = jobs.filter(j => j.statut !== "complete" && j.date === aujourd_hui).map(j => j.id);
    setSelectionIds(new Set(ids));
    setDestination("");
    setDestinationChoisie(null);
    setDepart("");
    setDepartChoisi(null);
    setPriorites(new Map());
    setModeItineraire(true);
  }

  async function genererItineraire() {
    const jobsSelectionnes = jobs.filter(j => selectionIds.has(j.id));
    if (jobsSelectionnes.length === 0) return;
    setOptimisant(true);
    try {
      // 1. Déterminer le point de départ
      let positionActuelle: { lat: number; lon: number } | null = null;
      if (departChoisi) {
        positionActuelle = { lat: departChoisi.lat, lon: departChoisi.lon };
      } else if (depart.trim()) {
        positionActuelle = await nominatimQuery(depart.trim() + ", Quebec, Canada");
      } else {
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
      }

      // 2. Geocoder toutes les adresses
      const coordonnees: Array<{ lat: number; lon: number } | null> = [];
      for (const j of jobsSelectionnes) {
        coordonnees.push(await geocoderAdresse(j.adresse, j.ville));
      }

      const avecCoords = jobsSelectionnes.map((j, i) => ({ ...j, ...(coordonnees[i] ?? { lat: 0, lon: 0 }) })).filter(j => j.lat !== 0);
      const sansCoords = jobsSelectionnes.filter((_, i) => !coordonnees[i]);

      const pointDepart = positionActuelle ?? (avecCoords[0] ?? null);
      const arrivee = destinationChoisie ?? null;

      // 3. Séparer prioritaires et restants
      const prioritaires = avecCoords
        .filter(j => priorites.has(j.id))
        .sort((a, b) => (priorites.get(a.id) ?? 0) - (priorites.get(b.id) ?? 0));
      const restants = avecCoords.filter(j => !priorites.has(j.id));

      // 4. Optimiser les restants
      const pointDepartRestants = prioritaires.length > 0
        ? prioritaires[prioritaires.length - 1]
        : pointDepart;

      let restantsOptimises: typeof restants;
      if (pointDepartRestants && restants.length > 1) {
        const pool = [...restants];
        restantsOptimises = [];
        let courant = pointDepartRestants;
        while (pool.length > 0) {
          let idx = 0, minDist = Infinity;
          for (let i = 0; i < pool.length; i++) { const d = distanceKm(courant, pool[i]); if (d < minDist) { minDist = d; idx = i; } }
          const suivant = pool.splice(idx, 1)[0];
          restantsOptimises.push(suivant);
          courant = suivant;
        }
        restantsOptimises = deuxOpt(restantsOptimises, pointDepartRestants, arrivee);
      } else {
        restantsOptimises = restants;
      }

      const optimises = [...prioritaires, ...restantsOptimises];
      if (pointDepart) {
        const avant = longueurTotale([...prioritaires, ...restants], pointDepart, arrivee);
        const apres = longueurTotale(optimises, pointDepart, arrivee);
        console.log(`Optimisation : ${avant.toFixed(1)} km → ${apres.toFixed(1)} km`);
      }

      // 5. Construire l'URL Google Maps
      const tousEnOrdre = [...optimises, ...sansCoords];
      const stops = tousEnOrdre.map(j => encodeURIComponent(`${j.adresse}, ${j.ville}, QC`));
      if (destinationChoisie) stops.push(`${destinationChoisie.lat},${destinationChoisie.lon}`);
      else if (destination.trim()) stops.push(encodeURIComponent(`${destination.trim()}, QC, Canada`));

      let startSegment = "";
      if (departChoisi) startSegment = `${departChoisi.lat},${departChoisi.lon}`;
      else if (positionActuelle) startSegment = `${positionActuelle.lat},${positionActuelle.lon}`;

      let url: string;
      if (startSegment) url = `https://www.google.com/maps/dir/${startSegment}/${stops.join("/")}`;
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

  // SVG icons
  const mapSvg = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
  const pinSvg = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
  const spinnerSvg = <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;

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
            <button onClick={genererItineraire} disabled={nbSelectionnes === 0 || optimisant} className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-700 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5">
              {optimisant ? spinnerSvg : mapSvg} Maps
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
          <p className="text-xs text-white/30 text-center">
            {nbSelectionnes > 0
              ? `${nbSelectionnes} job${nbSelectionnes > 1 ? "s" : ""} d'aujourd'hui pré-sélectionné${nbSelectionnes > 1 ? "s" : ""}. Modifie la sélection si besoin.`
              : "Coche les jobs à inclure, puis clique « Maps »"}
          </p>

          {/* Départ + Destination */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 space-y-3">
            {/* Point de départ */}
            <div>
              <label className="text-xs font-bold text-white/30 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m10-10h-4M6 12H2" /></svg>
                Partir de (optionnel)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={depart}
                  onChange={e => rechercherDepart(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestionsDepart(false), 150)}
                  onFocus={() => suggestionsDepart.length > 0 && setShowSuggestionsDepart(true)}
                  placeholder="GPS auto ou tapez une adresse..."
                  autoComplete="off"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                {departChoisi && (
                  <button type="button" onClick={() => { setDepart(""); setDepartChoisi(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg transition-colors">×</button>
                )}
                {showSuggestionsDepart && (
                  <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#13131a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
                    {suggestionsDepart.map((s, i) => (
                      <li key={i}>
                        <button type="button" onMouseDown={() => { setDepart(s.label); setDepartChoisi({ adresse: s.adresse, ville: s.ville, lat: s.lat, lon: s.lon }); setShowSuggestionsDepart(false); }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border-b border-white/[0.04] last:border-0 flex items-center gap-2">
                          <span className="text-emerald-400 shrink-0">{pinSvg}</span> {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {departChoisi && <p className="text-xs text-emerald-400 mt-1.5 font-medium">✓ Départ — {departChoisi.adresse}, {departChoisi.ville}</p>}
              {!departChoisi && !depart.trim() && <p className="text-xs text-white/20 mt-1 italic">Position GPS utilisée par défaut</p>}
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Destination finale */}
            <div>
              <label className="text-xs font-bold text-white/30 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21l3.75-7.5L12 12l5.25 1.5L21 21" /><circle cx="12" cy="7" r="3" /></svg>
                Terminer à (optionnel)
              </label>
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
                          className="w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 hover:text-red-400 transition-colors border-b border-white/[0.04] last:border-0 flex items-center gap-2">
                          <span className="text-red-400 shrink-0">{pinSvg}</span> {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {destinationChoisie && <p className="text-xs text-emerald-400 mt-1.5 font-medium">✓ Destination — {destinationChoisie.adresse}, {destinationChoisie.ville}</p>}
            </div>
          </div>

          {/* Priorités info */}
          {priorites.size > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 text-xs text-amber-400 font-medium">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
              {priorites.size} job{priorites.size > 1 ? "s" : ""} prioritaire{priorites.size > 1 ? "s" : ""} — visité{priorites.size > 1 ? "s" : ""} en premier
            </div>
          )}

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
                      {selectionIds.has(job.id) && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePriorite(job.id); }}
                          className={`w-7 h-7 rounded-full text-xs font-bold shrink-0 flex items-center justify-center transition-all ${
                            priorites.has(job.id)
                              ? "bg-amber-500 text-black shadow-sm shadow-amber-500/30"
                              : "bg-white/10 text-white/30 hover:bg-white/20"
                          }`}
                          title={priorites.has(job.id) ? "Retirer la priorité" : "Définir comme prioritaire"}
                        >
                          {priorites.has(job.id) ? priorites.get(job.id) : "#"}
                        </button>
                      )}
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
              className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-red-700 active:scale-[0.98] transition-all shadow disabled:opacity-60 flex items-center justify-center gap-2">
              {optimisant ? <>{spinnerSvg} Optimisation... ({nbSelectionnes} adresses)</> : <>{mapSvg} Générer itinéraire optimisé — {nbSelectionnes} arrêt{nbSelectionnes > 1 ? "s" : ""}</>}
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
            <button onClick={entrerModeItineraire} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white active:scale-95 transition-all flex items-center gap-1.5">
              {mapSvg} Itinéraire
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
                              <div className="relative shrink-0 ml-2">
                                <button type="button" onClick={(e) => { e.stopPropagation(); setStatutMenuOuvert(statutMenuOuvert === job.id ? null : job.id); }} className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all active:scale-95 ${STATUT_COLORS[job.statut]}`}>
                                  {STATUT_LABELS[job.statut]} ▾
                                </button>
                                {statutMenuOuvert === job.id && (
                                  <div className="absolute right-0 top-full mt-1 z-50 bg-[#13131a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden min-w-[120px]">
                                    {(["a_faire", "en_cours", "complete"] as Statut[]).filter(s => s !== job.statut).map(s => (
                                      <button type="button" key={s} onClick={() => { changerStatut(job, s); setStatutMenuOuvert(null); }}
                                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-0 ${STATUT_COLORS[s].split(" ").find(c => c.startsWith("text-"))}`}>
                                        {STATUT_LABELS[s]}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <a href={mapsUrl(job.adresse, job.ville)} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-2 group hover:bg-red-500/15 transition-colors">
                              <span className="text-red-400">{pinSvg}</span>
                              <span className="text-red-300 text-sm font-medium">{job.adresse}, {job.ville}</span>
                              <span className="text-red-400/50 text-xs ml-auto group-hover:text-red-300 transition-colors">Maps →</span>
                            </a>
                            {job.notes && <p className="text-xs text-white/30 italic bg-white/[0.03] rounded-lg px-2.5 py-1.5">{job.notes}</p>}

                            {/* Job Costing toggle */}
                            <button
                              type="button"
                              onClick={() => setCostingJobId(costingJobId === job.id ? null : job.id)}
                              className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors mt-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                              Coûts & marge {(job.couts?.length ?? 0) > 0 && `(${job.couts!.length})`}
                            </button>

                            {/* Costing panel */}
                            {costingJobId === job.id && (
                              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 mt-1 space-y-2">
                                {/* Timer */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Temps</span>
                                  <div className="flex items-center gap-2">
                                    {job.temps_debut && job.temps_fin && (
                                      <span className="text-xs text-white/40">
                                        {Math.round((new Date(job.temps_fin).getTime() - new Date(job.temps_debut).getTime()) / 60000)} min
                                      </span>
                                    )}
                                    {job.temps_debut && !job.temps_fin && (
                                      <span className="text-xs text-amber-400 animate-pulse">En cours...</span>
                                    )}
                                    <button
                                      onClick={() => toggleTimer(job)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                        job.temps_debut && !job.temps_fin
                                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      }`}
                                    >
                                      {job.temps_debut && !job.temps_fin ? "Stop" : "Start"}
                                    </button>
                                  </div>
                                </div>

                                {/* Existing costs */}
                                {(job.couts || []).map((cout, ci) => (
                                  <div key={ci} className="flex items-center gap-2 text-xs">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      cout.type === "materiel" ? "bg-blue-500/15 text-blue-400" :
                                      cout.type === "main_oeuvre" ? "bg-amber-500/15 text-amber-400" :
                                      "bg-purple-500/15 text-purple-400"
                                    }`}>
                                      {cout.type === "materiel" ? "MAT" : cout.type === "main_oeuvre" ? "M-O" : "S-T"}
                                    </span>
                                    <span className="text-white/40 flex-1 truncate">{cout.description}</span>
                                    <span className="text-white/50 font-bold shrink-0">{cout.montant.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span>
                                    <button onClick={() => supprimerCout(job, ci)} className="text-white/10 hover:text-red-400 transition-colors">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                ))}

                                {/* Add cost */}
                                <div className="flex gap-1.5 items-center">
                                  <select
                                    value={newCout.type}
                                    onChange={e => setNewCout(c => ({ ...c, type: e.target.value as CoutItem["type"] }))}
                                    className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[10px] text-white outline-none"
                                  >
                                    <option value="materiel">Matériel</option>
                                    <option value="main_oeuvre">Main d&apos;oeuvre</option>
                                    <option value="sous_traitant">Sous-traitant</option>
                                  </select>
                                  <input
                                    className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-white/20 outline-none"
                                    placeholder="Description"
                                    value={newCout.description}
                                    onChange={e => setNewCout(c => ({ ...c, description: e.target.value }))}
                                  />
                                  <input
                                    className="w-16 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-white/20 outline-none text-right"
                                    placeholder="$"
                                    type="number"
                                    step="0.01"
                                    value={newCout.montant}
                                    onChange={e => setNewCout(c => ({ ...c, montant: e.target.value }))}
                                  />
                                  <button
                                    onClick={() => ajouterCout(job)}
                                    className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-all shrink-0"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                  </button>
                                </div>

                                {/* Margin summary */}
                                {(job.montant || (job.couts?.length ?? 0) > 0) && (() => {
                                  const totalCouts = (job.couts || []).reduce((s, c) => s + c.montant, 0);
                                  const revenu = job.montant ?? 0;
                                  const marge = revenu - totalCouts;
                                  const pct = revenu > 0 ? Math.round((marge / revenu) * 100) : 0;
                                  return (
                                    <div className="border-t border-white/[0.06] pt-2 mt-1 flex items-center justify-between">
                                      <div className="flex gap-3 text-[10px]">
                                        <span className="text-white/25">Revenu: <span className="text-white/50 font-bold">{revenu.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}</span></span>
                                        <span className="text-white/25">Coûts: <span className="text-white/50 font-bold">{totalCouts.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}</span></span>
                                      </div>
                                      <span className={`text-xs font-black ${marge >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {marge >= 0 ? "+" : ""}{marge.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })} ({pct}%)
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
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
                            <button onClick={() => { if (job.statut !== "complete") changerStatut(job); }} className={`flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors ${job.statut === "complete" ? "text-white/15 cursor-default" : "text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20"}`} disabled={job.statut === "complete"}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              {job.statut === "complete" ? "Fait" : "Avancer"}
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
