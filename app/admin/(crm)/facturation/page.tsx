"use client";

import { useState, useEffect, useCallback } from "react";

const MOT_DE_PASSE = "l1a2m3B5";

type StatutFacture = "brouillon" | "envoyee" | "payee";

interface Facture {
  id: string;
  job_id: string | null;
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  description: string | null;
  montant: number;
  statut: StatutFacture;
  created_at: string;
}

interface Job {
  id: string;
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  montant: number | null;
  statut: string;
  notes: string | null;
}

const STATUT_LABELS: Record<StatutFacture, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
};

const STATUT_COLORS: Record<StatutFacture, string> = {
  brouillon: "bg-white/[0.06] text-white/40 border-white/10",
  envoyee: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  payee: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const STATUT_NEXT: Record<StatutFacture, StatutFacture> = {
  brouillon: "envoyee",
  envoyee: "payee",
  payee: "brouillon",
};

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

export default function FacturationPage() {
  const [authed, setAuthed] = useState(false);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [fromJob, setFromJob] = useState<string>("");
  const [form, setForm] = useState({ nom: "", telephone: "", adresse: "", ville: "", description: "", montant: "" });
  const [filter, setFilter] = useState<StatutFacture | "tous">("tous");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuthed(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, jRes] = await Promise.all([
        fetch("/api/admin/factures", { cache: "no-store" }),
        fetch("/api/jobs", { cache: "no-store" }),
      ]);
      if (fRes.ok) setFactures(await fRes.json());
      if (jRes.ok) setJobs(await jRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  if (!authed) return null;

  function selectJob(jobId: string) {
    setFromJob(jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setForm({
        nom: job.nom,
        telephone: job.telephone,
        adresse: job.adresse,
        ville: job.ville,
        description: job.notes || "",
        montant: String(job.montant ?? ""),
      });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: fromJob || null,
          nom: form.nom,
          telephone: form.telephone,
          adresse: form.adresse,
          ville: form.ville,
          description: form.description || null,
          montant: parseFloat(form.montant) || 0,
          statut: "brouillon",
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ nom: "", telephone: "", adresse: "", ville: "", description: "", montant: "" });
        setFromJob("");
        fetchData();
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function updateStatut(facture: Facture) {
    const next = STATUT_NEXT[facture.statut];
    try {
      await fetch("/api/admin/factures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: facture.id, statut: next }),
      });
      fetchData();
    } catch { /* ignore */ }
  }

  async function deleteFacture(id: string) {
    try {
      await fetch("/api/admin/factures", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch { /* ignore */ }
  }

  const filtered = filter === "tous" ? factures : factures.filter(f => f.statut === filter);
  const totalPayee = factures.filter(f => f.statut === "payee").reduce((s, f) => s + f.montant, 0);
  const totalEnAttente = factures.filter(f => f.statut === "envoyee").reduce((s, f) => s + f.montant, 0);
  const completedJobs = jobs.filter(j => j.statut === "complete");

  const inputCls = "bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:bg-white/[0.06] text-sm transition-all w-full";

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Facturation</h1>
          <p className="text-white/25 text-xs mt-0.5">Suivi des factures</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nouvelle facture
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">Total facturé</p>
            <p className="text-xl font-bold text-white">{fmt(factures.reduce((s, f) => s + f.montant, 0))}</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">Payé</p>
            <p className="text-xl font-bold text-emerald-400">{fmt(totalPayee)}</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">En attente</p>
            <p className="text-xl font-bold text-amber-400">{fmt(totalEnAttente)}</p>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm">Nouvelle facture</h3>

            {completedJobs.length > 0 && (
              <div>
                <label className="text-white/30 text-xs mb-1 block">Depuis un job complété</label>
                <select
                  value={fromJob}
                  onChange={e => selectJob(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Saisie manuelle —</option>
                  {completedJobs.map(j => (
                    <option key={j.id} value={j.id}>{j.nom} — {j.adresse}, {j.ville} {j.montant ? `(${fmt(j.montant)})` : ""}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
              <input className={inputCls} placeholder="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} required />
              <input className={inputCls} placeholder="Ville" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} required />
            </div>
            <input className={inputCls} placeholder="Description / notes" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className={inputCls} placeholder="Montant ($)" type="number" step="0.01" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} required />

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white transition-colors">Annuler</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50">
                {saving ? "..." : "Créer"}
              </button>
            </div>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {(["tous", "brouillon", "envoyee", "payee"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/30 hover:text-white/50"
              }`}
            >
              {f === "tous" ? "Tous" : STATUT_LABELS[f]}
              <span className="ml-1 text-white/20">
                {f === "tous" ? factures.length : factures.filter(x => x.statut === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/20 text-center py-16 text-sm">Aucune facture</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(f => (
              <div key={f.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{f.nom}</span>
                    <button
                      onClick={() => updateStatut(f)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUT_COLORS[f.statut]} hover:opacity-80 transition-opacity`}
                    >
                      {STATUT_LABELS[f.statut]}
                    </button>
                  </div>
                  <p className="text-white/30 text-xs">{f.adresse}, {f.ville}</p>
                  {f.description && <p className="text-white/20 text-xs mt-1 italic">{f.description}</p>}
                  <p className="text-white/15 text-[10px] mt-1">
                    {new Date(f.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-lg font-bold ${f.statut === "payee" ? "text-emerald-400" : "text-white/60"}`}>
                    {fmt(f.montant)}
                  </span>
                  <button
                    onClick={() => deleteFacture(f.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
