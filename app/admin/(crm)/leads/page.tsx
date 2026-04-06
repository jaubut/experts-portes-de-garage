"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const MOT_DE_PASSE = "l1a2m3B5";

type StatutLead = "nouveau" | "a_rappeler" | "job_planifie" | "complete" | "sans_suite";

interface Client {
  id: string;
  nom: string;
  telephone: string;
  courriel: string | null;
  adresse: string | null;
  ville: string;
  probleme: string;
  notes: string | null;
  statut: StatutLead;
  created_at: string;
}

const STATUT_LABELS: Record<StatutLead, string> = {
  nouveau: "Nouveau",
  a_rappeler: "À rappeler",
  job_planifie: "Job planifié",
  complete: "Complété",
  sans_suite: "Sans suite",
};

const STATUT_COLORS: Record<StatutLead, string> = {
  nouveau: "bg-blue-100 text-blue-700 border-blue-200",
  a_rappeler: "bg-orange-100 text-orange-700 border-orange-200",
  job_planifie: "bg-yellow-100 text-yellow-700 border-yellow-200",
  complete: "bg-green-100 text-green-700 border-green-200",
  sans_suite: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUT_NEXT: Record<StatutLead, StatutLead> = {
  nouveau: "a_rappeler",
  a_rappeler: "job_planifie",
  job_planifie: "complete",
  complete: "sans_suite",
  sans_suite: "nouveau",
};

const PIPELINE_ORDER: StatutLead[] = ["nouveau", "a_rappeler", "job_planifie", "complete", "sans_suite"];

type Suggestion = { adresse: string; ville: string; label: string };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
}

function AdresseInput({ value, onChange, onSelect, placeholder = "Adresse" }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(q: string) {
    onChange(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 4) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", Quebec, Canada")}&format=json&addressdetails=1&limit=6&countrycodes=ca`,
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
            return { adresse: `${num} ${rue}`.trim(), ville, label: [num, rue, ville].filter(Boolean).join(", ") };
          })
          .filter(r => r.adresse && r.ville);
        setSuggestions(results);
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
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 transition-colors"
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => { onSelect(s); setOpen(false); }}
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
  );
}

const FORM_VIDE = { nom: "", telephone: "", adresse: "", ville: "", probleme: "", courriel: "", notes: "" };

export default function LeadsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [mdp, setMdp] = useState("");
  const [mdpErreur, setMdpErreur] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<StatutLead | "">("");

  const [showAjout, setShowAjout] = useState(false);
  const [ajoutForm, setAjoutForm] = useState(FORM_VIDE);
  const [savingAjout, setSavingAjout] = useState(false);

  const [editOuvert, setEditOuvert] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof FORM_VIDE>(FORM_VIDE);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("dicter_auth");
    if (saved === MOT_DE_PASSE) setAuth(true);
  }, []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth) fetchClients();
  }, [auth, fetchClients]);

  function soumettreMdp(e: React.FormEvent) {
    e.preventDefault();
    if (mdp === MOT_DE_PASSE) { sessionStorage.setItem("dicter_auth", mdp); setAuth(true); }
    else setMdpErreur(true);
  }

  async function ajouterLead(e: React.FormEvent) {
    e.preventDefault();
    setSavingAjout(true);
    await fetch("/api/client-rapide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: ajoutForm.nom,
        telephone: ajoutForm.telephone,
        adresse: ajoutForm.adresse || undefined,
        ville: ajoutForm.ville,
        probleme: ajoutForm.probleme || "Non précisé",
        courriel: ajoutForm.courriel || undefined,
        notes: ajoutForm.notes || undefined,
      }),
    });
    setAjoutForm(FORM_VIDE);
    setShowAjout(false);
    await fetchClients();
    setSavingAjout(false);
  }

  async function changerStatut(client: Client, newStatut: StatutLead) {
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, statut: newStatut } : c));
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut }),
    });
  }

  function ouvrirEdit(client: Client) {
    setEditOuvert(client.id);
    setEditForm({
      nom: client.nom,
      telephone: client.telephone,
      adresse: client.adresse ?? "",
      ville: client.ville,
      probleme: client.probleme,
      courriel: client.courriel ?? "",
      notes: client.notes ?? "",
    });
  }

  async function sauvegarderEdit(client: Client) {
    setSavingEdit(true);
    const payload = {
      nom: editForm.nom,
      telephone: editForm.telephone,
      adresse: editForm.adresse || null,
      ville: editForm.ville,
      probleme: editForm.probleme,
      courriel: editForm.courriel || null,
      notes: editForm.notes || null,
    };
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, ...payload } as Client : c));
    setEditOuvert(null);
    setSavingEdit(false);
  }

  async function supprimerClient(id: string) {
    if (!confirm("Supprimer ce client?")) return;
    setClients((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
  }

  function transfererVersJob(client: Client) {
    sessionStorage.setItem("job_prefill", JSON.stringify({
      nom: client.nom,
      telephone: client.telephone,
      adresse: client.adresse ?? "",
      ville: client.ville,
    }));
    changerStatut(client, "job_planifie");
    router.push("/admin/jobs");
  }

  if (!auth) {
    return (
      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center px-4">
        <form onSubmit={soumettreMdp} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <p className="text-gray-400 text-sm text-center mb-2 uppercase tracking-widest">Experts Portes de Garage</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6 text-center">Espace admin</h1>
          <input type="password" value={mdp} onChange={(e) => { setMdp(e.target.value); setMdpErreur(false); }} placeholder="Mot de passe" autoFocus className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:border-red-600" />
          {mdpErreur && <p className="text-red-500 text-xs mb-3">Mot de passe incorrect</p>}
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">Entrer</button>
        </form>
      </div>
    );
  }

  const clientsFiltres = filtreStatut
    ? clients.filter((c) => c.statut === filtreStatut)
    : clients.filter((c) => c.statut !== "complete" && c.statut !== "sans_suite");

  const counts = PIPELINE_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = clients.filter((c) => c.statut === s).length;
    return acc;
  }, {});

  const urgents = clients.filter((c) => c.statut === "nouveau" || c.statut === "a_rappeler").length;

  return (
    <div className="flex-1 bg-[#f5f5f5] flex flex-col">

      {/* Barre d'actions */}
      <div className="bg-[#1a1a1a]/90 border-b border-white/10 px-4 py-2.5 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-white/50 text-xs">
            {urgents > 0
              ? <span className="text-orange-400 font-semibold">{urgents} à contacter</span>
              : `${clients.length} clients`}
          </p>
          <button
            onClick={() => { setShowAjout(!showAjout); setEditOuvert(null); }}
            className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 active:scale-95 transition-all"
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Filtres pipeline */}
      <div className="bg-[#1a1a1a]/80 border-b border-white/10 px-4 py-2.5 overflow-x-auto shrink-0">
        <div className="flex gap-2 min-w-max max-w-3xl mx-auto">
          <button onClick={() => setFiltreStatut("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
              !filtreStatut ? "bg-red-600 text-white shadow-sm" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            }`}
          >
            Actifs ({clients.filter(c => c.statut !== "complete" && c.statut !== "sans_suite").length})
          </button>
          {PIPELINE_ORDER.map((s) => (
            <button key={s} onClick={() => setFiltreStatut(filtreStatut === s ? "" : s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                filtreStatut === s ? "bg-red-600 text-white shadow-sm" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
              }`}
            >
              {STATUT_LABELS[s]} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-3">

        {/* Formulaire ajout */}
        {showAjout && (
          <form onSubmit={ajouterLead} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3 animate-in fade-in duration-200">
            <h2 className="font-bold text-[#1a1a1a]">Nouveau client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(["nom", "telephone", "adresse", "ville", "probleme", "courriel"] as (keyof typeof FORM_VIDE)[]).map((key) => {
                const labels: Record<string, string> = { nom: "Nom *", telephone: "Téléphone *", adresse: "Adresse", ville: "Ville *", probleme: "Problème", courriel: "Courriel" };
                const wide = key === "probleme";
                if (key === "adresse") {
                  return (
                    <div key={key}>
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Adresse</label>
                      <AdresseInput value={ajoutForm.adresse} onChange={v => setAjoutForm(f => ({ ...f, adresse: v }))} onSelect={s => setAjoutForm(f => ({ ...f, adresse: s.adresse, ville: s.ville }))} />
                    </div>
                  );
                }
                return (
                  <div key={key} className={wide ? "md:col-span-2" : ""}>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">{labels[key]}</label>
                    <input value={ajoutForm[key]} onChange={e => setAjoutForm(f => ({ ...f, [key]: e.target.value }))} required={["nom", "telephone", "ville"].includes(key)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                  </div>
                );
              })}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Notes</label>
                <textarea value={ajoutForm.notes} onChange={e => setAjoutForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 resize-none transition-colors" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={savingAjout} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50">
                {savingAjout ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button type="button" onClick={() => setShowAjout(false)} className="text-gray-400 text-sm hover:text-gray-600 px-3 transition-colors">Annuler</button>
            </div>
          </form>
        )}

        {/* Bannière urgente */}
        {!filtreStatut && urgents > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-semibold">
            🔔 {urgents} client{urgents > 1 ? "s" : ""} à contacter
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16">Chargement...</div>
        ) : clientsFiltres.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-semibold">Aucun lead actif</p>
            <p className="text-sm mt-1">Clique sur &quot;+ Ajouter&quot; pour en créer un</p>
          </div>
        ) : (
          clientsFiltres.map((client) => (
            <div key={client.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-150 hover:shadow-md ${client.statut === "complete" || client.statut === "sans_suite" ? "opacity-40" : ""}`}>

              {editOuvert !== client.id ? (
                <>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[#1a1a1a] text-base truncate">{client.nom}</span>
                        <span className="text-xs text-gray-300 shrink-0">{formatDate(client.created_at)}</span>
                      </div>
                      <button
                        onClick={() => changerStatut(client, STATUT_NEXT[client.statut])}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ml-2 transition-all active:scale-95 ${STATUT_COLORS[client.statut]}`}
                      >
                        {STATUT_LABELS[client.statut]}
                      </button>
                    </div>
                    <a href={`tel:${client.telephone}`} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-2 group hover:bg-red-100 transition-colors">
                      <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" /></svg>
                      <span className="text-red-700 font-bold text-sm">{client.telephone}</span>
                      <span className="text-red-400 text-xs ml-auto group-hover:text-red-600 transition-colors">Appeler →</span>
                    </a>
                    <p className="text-sm text-gray-600">📍 {client.adresse ? `${client.adresse}, ` : ""}{client.ville}</p>
                    <p className="text-sm text-gray-500 italic mt-0.5">{client.probleme}</p>
                    {client.notes && <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 italic">{client.notes}</p>}
                  </div>
                  <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
                    <button onClick={() => ouvrirEdit(client)} className="flex items-center justify-center gap-1.5 py-3 text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Modifier
                    </button>
                    <button onClick={() => transfererVersJob(client)} className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 active:bg-green-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Créer job
                    </button>
                    <button onClick={() => supprimerClient(client.id)} className="flex items-center justify-center gap-1.5 py-3 text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Supprimer
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1a1a1a]">Modifier — {client.nom}</h3>
                    <button onClick={() => setEditOuvert(null)} className="text-gray-400 hover:text-gray-600 text-lg transition-colors">✕</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(["nom", "telephone", "adresse", "ville", "probleme", "courriel"] as (keyof typeof FORM_VIDE)[]).map((key) => {
                      const labels: Record<string, string> = { nom: "Nom", telephone: "Téléphone", adresse: "Adresse", ville: "Ville", probleme: "Problème", courriel: "Courriel" };
                      const wide = key === "probleme";
                      if (key === "adresse") {
                        return (
                          <div key={key}>
                            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Adresse</label>
                            <AdresseInput value={editForm.adresse} onChange={v => setEditForm(f => ({ ...f, adresse: v }))} onSelect={s => setEditForm(f => ({ ...f, adresse: s.adresse, ville: s.ville }))} />
                          </div>
                        );
                      }
                      return (
                        <div key={key} className={wide ? "md:col-span-2" : ""}>
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">{labels[key]}</label>
                          <input value={editForm[key] ?? ""} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                        </div>
                      );
                    })}
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Notes</label>
                      <textarea value={editForm.notes ?? ""} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 resize-none transition-colors" />
                    </div>
                  </div>
                  <button onClick={() => sauvegarderEdit(client)} disabled={savingEdit} className="w-full mt-4 bg-red-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50">
                    {savingEdit ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
