"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const MOT_DE_PASSE = "l1a2m3B5";
const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;

type StatutSoumission = "brouillon" | "envoyee" | "approuvee" | "refusee";

interface LineItem {
  description: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

interface Option {
  nom: string;
  items: LineItem[];
  sous_total: number;
  tps: number;
  tvq: number;
  total: number;
}

interface Soumission {
  id: string;
  client_id: string | null;
  numero: string;
  statut: StatutSoumission;
  options: Option[];
  option_choisie: number | null;
  notes: string | null;
  created_at: string;
}

interface Client {
  id: string;
  nom: string;
  telephone: string;
  adresse: string | null;
  ville: string;
}

interface InventaireItem {
  id: string;
  nom: string;
  categorie: string;
  prix_unitaire: number;
}

const STATUT_LABELS: Record<StatutSoumission, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  approuvee: "Approuvée",
  refusee: "Refusée",
};

const STATUT_COLORS: Record<StatutSoumission, string> = {
  brouillon: "bg-white/[0.06] text-white/40 border-white/10",
  envoyee: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approuvee: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  refusee: "bg-red-500/15 text-red-400 border-red-500/30",
};

const OPTION_COLORS = [
  { bg: "bg-white/[0.03]", border: "border-white/[0.08]", accent: "text-white/60", label: "Standard" },
  { bg: "bg-blue-500/5", border: "border-blue-500/20", accent: "text-blue-400", label: "Recommandé" },
  { bg: "bg-emerald-500/5", border: "border-emerald-500/20", accent: "text-emerald-400", label: "Premium" },
];

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
}

function makeEmptyOption(nom: string): Option {
  return { nom, items: [{ description: "", quantite: 1, prix_unitaire: 0, total: 0 }], sous_total: 0, tps: 0, tvq: 0, total: 0 };
}

function recalcOption(opt: Option): Option {
  const items = opt.items.map(it => ({ ...it, total: it.quantite * it.prix_unitaire }));
  const sous_total = items.reduce((s, it) => s + it.total, 0);
  const tps = sous_total * TPS_RATE;
  const tvq = sous_total * TVQ_RATE;
  return { ...opt, items, sous_total, tps, tvq, total: sous_total + tps + tvq };
}

export default function SoumissionsPage() {
  const [authed, setAuthed] = useState(false);
  const [soumissions, setSoumissions] = useState<Soumission[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inventaire, setInventaire] = useState<InventaireItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatutSoumission | "tous">("tous");
  const [saving, setSaving] = useState(false);

  // Form state
  const [clientId, setClientId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [options, setOptions] = useState<Option[]>([
    makeEmptyOption("Standard"),
    makeEmptyOption("Recommandé"),
    makeEmptyOption("Premium"),
  ]);
  const [activeTab, setActiveTab] = useState(0);

  // Expanded soumission detail
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuthed(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes, iRes] = await Promise.all([
        fetch("/api/admin/soumissions", { cache: "no-store" }),
        fetch("/api/clients", { cache: "no-store" }),
        fetch("/api/admin/inventaire", { cache: "no-store" }),
      ]);
      if (sRes.ok) setSoumissions(await sRes.json());
      if (cRes.ok) setClients(await cRes.json());
      if (iRes.ok) setInventaire(await iRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  // Prefill from leads
  useEffect(() => {
    const prefill = sessionStorage.getItem("soumission_prefill");
    if (!prefill) return;
    sessionStorage.removeItem("soumission_prefill");
    try {
      const data = JSON.parse(prefill);
      if (data.client_id) setClientId(data.client_id);
      setShowForm(true);
    } catch { /* ignore */ }
  }, []);

  if (!authed) return null;

  function resetForm() {
    setClientId("");
    setNotes("");
    setOptions([makeEmptyOption("Standard"), makeEmptyOption("Recommandé"), makeEmptyOption("Premium")]);
    setActiveTab(0);
    setEditId(null);
    setShowForm(false);
  }

  function updateItem(optIdx: number, itemIdx: number, field: keyof LineItem, value: string | number) {
    setOptions(prev => {
      const next = [...prev];
      const opt = { ...next[optIdx], items: [...next[optIdx].items] };
      opt.items[itemIdx] = { ...opt.items[itemIdx], [field]: field === "description" ? value : (parseFloat(String(value)) || 0) };
      next[optIdx] = recalcOption(opt);
      return next;
    });
  }

  function addItem(optIdx: number) {
    setOptions(prev => {
      const next = [...prev];
      const opt = { ...next[optIdx], items: [...next[optIdx].items, { description: "", quantite: 1, prix_unitaire: 0, total: 0 }] };
      next[optIdx] = opt;
      return next;
    });
  }

  function removeItem(optIdx: number, itemIdx: number) {
    setOptions(prev => {
      const next = [...prev];
      const opt = { ...next[optIdx], items: next[optIdx].items.filter((_, i) => i !== itemIdx) };
      next[optIdx] = recalcOption(opt);
      return next;
    });
  }

  function insertFromInventaire(optIdx: number, inv: InventaireItem) {
    setOptions(prev => {
      const next = [...prev];
      const opt = { ...next[optIdx], items: [...next[optIdx].items, { description: inv.nom, quantite: 1, prix_unitaire: inv.prix_unitaire, total: inv.prix_unitaire }] };
      next[optIdx] = recalcOption(opt);
      return next;
    });
  }

  function startEdit(s: Soumission) {
    setClientId(s.client_id || "");
    setNotes(s.notes || "");
    setOptions(s.options.length === 3 ? s.options : [makeEmptyOption("Standard"), makeEmptyOption("Recommandé"), makeEmptyOption("Premium")]);
    setActiveTab(0);
    setEditId(s.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const recalced = options.map(recalcOption);
    try {
      if (editId) {
        await fetch("/api/admin/soumissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, client_id: clientId || null, options: recalced, notes: notes || null }),
        });
      } else {
        await fetch("/api/admin/soumissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId || null, options: recalced, notes: notes || null }),
        });
      }
      resetForm();
      fetchData();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function updateStatut(s: Soumission, statut: StatutSoumission, optionChoisie?: number) {
    try {
      const body: Record<string, unknown> = { id: s.id, statut };
      if (optionChoisie !== undefined) body.option_choisie = optionChoisie;
      await fetch("/api/admin/soumissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      fetchData();
    } catch { /* ignore */ }
  }

  async function deleteSoumission(id: string) {
    try {
      await fetch("/api/admin/soumissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch { /* ignore */ }
  }

  async function convertirEnJob(s: Soumission) {
    const optIdx = s.option_choisie ?? 0;
    const opt = s.options[optIdx];
    const client = clients.find(c => c.id === s.client_id);
    if (!client) { alert("Client introuvable"); return; }

    const desc = opt.items.map(it => `${it.description} (x${it.quantite})`).join(", ");
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: s.client_id,
          soumission_id: s.id,
          nom: client.nom,
          telephone: client.telephone,
          adresse: client.adresse || "",
          ville: client.ville,
          date: new Date().toISOString().split("T")[0],
          notes: desc,
          montant: opt.total,
        }),
      });
      updateStatut(s, "approuvee", optIdx);
      fetchData();
    } catch { /* ignore */ }
  }

  const filtered = filter === "tous" ? soumissions : soumissions.filter(s => s.statut === filter);
  const totalEnAttente = soumissions.filter(s => s.statut === "envoyee").reduce((sum, s) => {
    const best = s.options.reduce((max, o) => Math.max(max, o.total), 0);
    return sum + best;
  }, 0);
  const totalApprouve = soumissions.filter(s => s.statut === "approuvee").reduce((sum, s) => {
    const opt = s.options[s.option_choisie ?? 0];
    return sum + (opt?.total ?? 0);
  }, 0);

  const inputCls = "bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:bg-white/[0.06] text-sm transition-all w-full";

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Soumissions</h1>
          <p className="text-white/25 text-xs mt-0.5">Good / Better / Best</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nouvelle
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">Total</p>
            <p className="text-xl font-bold">{soumissions.length}</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">En attente</p>
            <p className="text-xl font-bold text-amber-400">{fmt(totalEnAttente)}</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">Approuvé</p>
            <p className="text-xl font-bold text-emerald-400">{fmt(totalApprouve)}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm">{editId ? "Modifier la soumission" : "Nouvelle soumission"}</h3>

            {/* Client selector */}
            <div>
              <label className="text-white/30 text-xs mb-1 block">Client</label>
              <select className={inputCls} value={clientId} onChange={e => setClientId(e.target.value)} required>
                <option value="">— Sélectionner un client —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} — {c.telephone}</option>
                ))}
              </select>
            </div>

            {/* Option tabs */}
            <div className="flex gap-1">
              {options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeTab === i
                      ? `${OPTION_COLORS[i].bg} ${OPTION_COLORS[i].border} ${OPTION_COLORS[i].accent}`
                      : "bg-white/[0.02] border-white/[0.04] text-white/20"
                  }`}
                >
                  {opt.nom}
                  {opt.total > 0 && <span className="ml-1 opacity-60">{fmt(opt.total)}</span>}
                </button>
              ))}
            </div>

            {/* Active option editor */}
            <div className={`${OPTION_COLORS[activeTab].bg} border ${OPTION_COLORS[activeTab].border} rounded-xl p-4`}>
              {/* Price book quick add */}
              {inventaire.length > 0 && (
                <div className="mb-3">
                  <label className="text-white/25 text-[10px] mb-1 block uppercase tracking-wider">Ajouter depuis inventaire</label>
                  <select
                    className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs outline-none w-full"
                    value=""
                    onChange={e => {
                      const inv = inventaire.find(i => i.id === e.target.value);
                      if (inv) insertFromInventaire(activeTab, inv);
                    }}
                  >
                    <option value="">— Choisir un article —</option>
                    {inventaire.map(i => (
                      <option key={i.id} value={i.id}>{i.nom} ({i.categorie}) — {fmt(i.prix_unitaire)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Line items */}
              <div className="flex flex-col gap-2">
                {options[activeTab].items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_60px_90px_70px_32px] gap-2 items-center">
                    <input
                      className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-red-500/50"
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateItem(activeTab, idx, "description", e.target.value)}
                    />
                    <input
                      className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-2 text-white text-xs outline-none text-center focus:border-red-500/50"
                      type="number"
                      min="1"
                      placeholder="Qté"
                      value={item.quantite || ""}
                      onChange={e => updateItem(activeTab, idx, "quantite", e.target.value)}
                    />
                    <input
                      className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-2 text-white text-xs outline-none text-right focus:border-red-500/50"
                      type="number"
                      step="0.01"
                      placeholder="Prix $"
                      value={item.prix_unitaire || ""}
                      onChange={e => updateItem(activeTab, idx, "prix_unitaire", e.target.value)}
                    />
                    <span className="text-xs text-white/40 text-right">{fmt(item.quantite * item.prix_unitaire)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(activeTab, idx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addItem(activeTab)}
                className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Ajouter une ligne
              </button>

              {/* Totals */}
              <div className="mt-4 border-t border-white/[0.06] pt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">Sous-total</span>
                  <span className="text-white/60">{fmt(options[activeTab].items.reduce((s, it) => s + it.quantite * it.prix_unitaire, 0))}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">TPS (5%)</span>
                  <span className="text-white/40">{fmt(options[activeTab].items.reduce((s, it) => s + it.quantite * it.prix_unitaire, 0) * TPS_RATE)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">TVQ (9.975%)</span>
                  <span className="text-white/40">{fmt(options[activeTab].items.reduce((s, it) => s + it.quantite * it.prix_unitaire, 0) * TVQ_RATE)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Total</span>
                  <span className={OPTION_COLORS[activeTab].accent}>
                    {fmt(options[activeTab].items.reduce((s, it) => s + it.quantite * it.prix_unitaire, 0) * (1 + TPS_RATE + TVQ_RATE))}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <input className={inputCls} placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} />

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white transition-colors">Annuler</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50">
                {saving ? "..." : editId ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {(["tous", "brouillon", "envoyee", "approuvee", "refusee"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/30 hover:text-white/50"
              }`}
            >
              {f === "tous" ? "Tous" : STATUT_LABELS[f]}
              <span className="ml-1 text-white/20">
                {f === "tous" ? soumissions.length : soumissions.filter(x => x.statut === f).length}
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
          <p className="text-white/20 text-center py-16 text-sm">Aucune soumission</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(s => {
              const client = clients.find(c => c.id === s.client_id);
              const isExpanded = expandedId === s.id;

              return (
                <div key={s.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                  {/* Header row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-white/30">{s.numero}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUT_COLORS[s.statut]}`}>
                          {STATUT_LABELS[s.statut]}
                        </span>
                        {s.option_choisie !== null && (
                          <span className="text-[10px] text-emerald-400">Option: {s.options[s.option_choisie]?.nom}</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{client?.nom ?? "Client inconnu"}</p>
                      {client && <p className="text-white/30 text-xs">{client.telephone}</p>}
                      <p className="text-white/15 text-[10px] mt-1">
                        {new Date(s.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {s.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] text-white/20">{opt.nom}</span>
                          <span className={`text-xs font-bold ${i === 2 ? "text-emerald-400" : i === 1 ? "text-blue-400" : "text-white/50"}`}>
                            {fmt(opt.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] p-4">
                      {/* 3 options side by side */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {s.options.map((opt, i) => (
                          <div key={i} className={`${OPTION_COLORS[i].bg} border ${OPTION_COLORS[i].border} rounded-xl p-3 ${s.option_choisie === i ? "ring-2 ring-emerald-500/50" : ""}`}>
                            <p className={`text-xs font-bold mb-2 ${OPTION_COLORS[i].accent}`}>{opt.nom}</p>
                            {opt.items.map((it, j) => (
                              <div key={j} className="flex justify-between text-[11px] text-white/40 mb-0.5">
                                <span className="truncate mr-2">{it.description || "—"}</span>
                                <span className="shrink-0">{it.quantite}x {fmt(it.prix_unitaire)}</span>
                              </div>
                            ))}
                            <div className="border-t border-white/[0.06] mt-2 pt-2">
                              <div className="flex justify-between text-xs font-bold">
                                <span>Total</span>
                                <span className={OPTION_COLORS[i].accent}>{fmt(opt.total)}</span>
                              </div>
                            </div>

                            {/* Approve this option */}
                            {s.statut !== "approuvee" && s.statut !== "refusee" && (
                              <button
                                onClick={() => convertirEnJob({ ...s, option_choisie: i })}
                                className="mt-2 w-full py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-all"
                              >
                                Approuver + Créer job
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {s.notes && <p className="text-white/20 text-xs italic mb-3">{s.notes}</p>}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {s.statut === "brouillon" && (
                          <button onClick={() => updateStatut(s, "envoyee")} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all">
                            Marquer envoyée
                          </button>
                        )}
                        {s.statut !== "refusee" && s.statut !== "approuvee" && (
                          <button onClick={() => updateStatut(s, "refusee")} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                            Refusée
                          </button>
                        )}
                        <button onClick={() => startEdit(s)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs font-bold hover:text-white hover:bg-white/[0.08] transition-all">
                          Modifier
                        </button>
                        <button onClick={() => deleteSoumission(s.id)} className="px-3 py-1.5 rounded-lg text-white/15 text-xs hover:text-red-400 transition-colors">
                          Supprimer
                        </button>
                        {s.statut === "approuvee" && (
                          <Link href="/admin/jobs" className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                            Voir les jobs
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
