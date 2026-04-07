"use client";

import { useState, useEffect, useCallback } from "react";

const MOT_DE_PASSE = "l1a2m3B5";

const CATEGORIES = [
  "Coupe-froid",
  "Ressorts",
  "Câbles",
  "Roulettes",
  "Charnières",
  "Moteurs / Ouvre-portes",
  "Télécommandes",
  "Panneaux",
  "Quincaillerie",
  "Autre",
];

interface Item {
  id: string;
  nom: string;
  categorie: string;
  quantite: number;
  seuil_min: number;
  prix_unitaire: number;
  notes: string | null;
  created_at: string;
}

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
}

export default function InventairePage() {
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: "", categorie: CATEGORIES[0], quantite: "", seuil_min: "2", prix_unitaire: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("tous");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuthed(true);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventaire", { cache: "no-store" });
      if (res.ok) setItems(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) fetchItems(); }, [authed, fetchItems]);

  if (!authed) return null;

  function resetForm() {
    setForm({ nom: "", categorie: CATEGORIES[0], quantite: "", seuil_min: "2", prix_unitaire: "", notes: "" });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(item: Item) {
    setForm({
      nom: item.nom,
      categorie: item.categorie,
      quantite: String(item.quantite),
      seuil_min: String(item.seuil_min),
      prix_unitaire: String(item.prix_unitaire),
      notes: item.notes || "",
    });
    setEditId(item.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nom: form.nom,
        categorie: form.categorie,
        quantite: parseInt(form.quantite) || 0,
        seuil_min: parseInt(form.seuil_min) || 2,
        prix_unitaire: parseFloat(form.prix_unitaire) || 0,
        notes: form.notes || null,
      };

      if (editId) {
        await fetch("/api/admin/inventaire", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
      } else {
        await fetch("/api/admin/inventaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      fetchItems();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    try {
      await fetch("/api/admin/inventaire", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchItems();
    } catch { /* ignore */ }
  }

  async function adjustQty(item: Item, delta: number) {
    const newQty = Math.max(0, item.quantite + delta);
    try {
      await fetch("/api/admin/inventaire", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, quantite: newQty }),
      });
      fetchItems();
    } catch { /* ignore */ }
  }

  const lowStockCount = items.filter(i => i.quantite <= i.seuil_min).length;
  const totalValue = items.reduce((s, i) => s + i.quantite * i.prix_unitaire, 0);
  const usedCategories = [...new Set(items.map(i => i.categorie))];

  let filtered = items;
  if (filterCat !== "tous") filtered = filtered.filter(i => i.categorie === filterCat);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(i => i.nom.toLowerCase().includes(q) || i.categorie.toLowerCase().includes(q));
  }

  const inputCls = "bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:bg-white/[0.06] text-sm transition-all w-full";

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Inventaire</h1>
          <p className="text-white/25 text-xs mt-0.5">Pièces et matériaux</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Ajouter
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">Articles</p>
            <p className="text-xl font-bold">{items.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">Valeur totale</p>
            <p className="text-xl font-bold text-emerald-400">{fmt(totalValue)}</p>
          </div>
          <div className={`border rounded-xl p-4 ${lowStockCount > 0 ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-1">Stock bas</p>
            <p className={`text-xl font-bold ${lowStockCount > 0 ? "text-red-400" : "text-emerald-400"}`}>{lowStockCount}</p>
          </div>
        </div>

        {/* Alert stock bas */}
        {lowStockCount > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Alerte stock bas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.filter(i => i.quantite <= i.seuil_min).map(i => (
                <span key={i.id} className="text-xs bg-red-500/10 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/20">
                  {i.nom} <span className="text-red-400 font-bold">({i.quantite})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm">{editId ? "Modifier l'article" : "Nouvel article"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Nom de la pièce" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
              <select className={inputCls} value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input className={inputCls} placeholder="Quantité" type="number" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} required />
              <input className={inputCls} placeholder="Seuil minimum" type="number" value={form.seuil_min} onChange={e => setForm({ ...form, seuil_min: e.target.value })} />
              <input className={inputCls} placeholder="Prix unitaire ($)" type="number" step="0.01" value={form.prix_unitaire} onChange={e => setForm({ ...form, prix_unitaire: e.target.value })} />
            </div>
            <input className={inputCls} placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white transition-colors">Annuler</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50">
                {saving ? "..." : editId ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-white/20 outline-none focus:border-red-500/50 text-xs w-48"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCat("tous")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filterCat === "tous" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/30 hover:text-white/50"}`}
            >
              Tous
            </button>
            {usedCategories.map(c => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filterCat === c ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/30 hover:text-white/50"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Items list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/20 text-center py-16 text-sm">Aucun article</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(item => {
              const isLow = item.quantite <= item.seuil_min;
              return (
                <div key={item.id} className={`bg-white/[0.03] border rounded-xl p-4 flex items-center gap-3 ${isLow ? "border-red-500/20" : "border-white/[0.06]"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{item.nom}</span>
                      <span className="text-[10px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded">{item.categorie}</span>
                      {isLow && <span className="text-[10px] text-red-400 font-bold">STOCK BAS</span>}
                    </div>
                    {item.notes && <p className="text-white/20 text-xs italic">{item.notes}</p>}
                    {item.prix_unitaire > 0 && <p className="text-white/15 text-[10px] mt-0.5">{fmt(item.prix_unitaire)} / unité</p>}
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => adjustQty(item, -1)} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all text-lg font-bold">−</button>
                    <span className={`w-10 text-center font-bold text-lg ${isLow ? "text-red-400" : "text-white"}`}>{item.quantite}</span>
                    <button onClick={() => adjustQty(item, 1)} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all text-lg font-bold">+</button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/15 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Modifier">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Supprimer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
