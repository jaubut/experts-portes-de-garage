"use client";

import { useState, useEffect, useCallback } from "react";

const MOT_DE_PASSE = "l1a2m3B5";
const FR_MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface Stats {
  totalLeads: number; leadsActifs: number; leadsConvertis: number; tauxConversion: number;
  pipelineTotal: number; pipelineActif: number; revenuTotal: number; revenuMoyen: number;
  jobsAFaire: number; jobsEnCours: number; jobsCompletes: number;
  revenusMensuels: Record<string, number>; jobsMensuels: Record<string, number>; leadsMensuels: Record<string, number>;
}

interface Job {
  id: string; nom: string; adresse: string; ville: string; date: string;
  statut: string; montant: number | null; notes: string | null;
}

interface Facture {
  id: string; nom: string; montant: number; statut: string; created_at: string;
}

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

type Periode = "30j" | "90j" | "6m" | "12m" | "tout";

export default function RapportsPage() {
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(false);
  const [periode, setPeriode] = useState<Periode>("12m");

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuthed(true);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, jRes, fRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/jobs", { cache: "no-store" }),
        fetch("/api/admin/factures", { cache: "no-store" }),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (jRes.ok) setJobs(await jRes.json());
      if (fRes.ok) setFactures(await fRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) fetchAll(); }, [authed, fetchAll]);

  if (!authed) return null;

  // Filter by period
  const now = new Date();
  const cutoff: Record<Periode, Date> = {
    "30j": new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
    "90j": new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90),
    "6m": new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
    "12m": new Date(now.getFullYear(), now.getMonth() - 12, now.getDate()),
    "tout": new Date(2000, 0, 1),
  };
  const since = cutoff[periode];

  const filteredJobs = jobs.filter(j => new Date(j.date) >= since);
  const filteredFactures = factures.filter(f => new Date(f.created_at) >= since);

  const jobsCompletes = filteredJobs.filter(j => j.statut === "complete");
  const jobsAvecMontant = jobsCompletes.filter(j => j.montant);
  const revenuJobs = jobsAvecMontant.reduce((s, j) => s + (j.montant ?? 0), 0);
  const revenuMoyen = jobsAvecMontant.length > 0 ? Math.round(revenuJobs / jobsAvecMontant.length) : 0;

  const facturesPayees = filteredFactures.filter(f => f.statut === "payee");
  const revenuFacture = facturesPayees.reduce((s, f) => s + f.montant, 0);
  const facturesEnAttente = filteredFactures.filter(f => f.statut === "envoyee");
  const montantEnAttente = facturesEnAttente.reduce((s, f) => s + f.montant, 0);

  // Group jobs by month for chart
  const jobsByMonth: Record<string, { total: number; complete: number; revenu: number }> = {};
  for (const job of filteredJobs) {
    const key = job.date?.substring(0, 7);
    if (!key) continue;
    if (!jobsByMonth[key]) jobsByMonth[key] = { total: 0, complete: 0, revenu: 0 };
    jobsByMonth[key].total++;
    if (job.statut === "complete") {
      jobsByMonth[key].complete++;
      jobsByMonth[key].revenu += job.montant ?? 0;
    }
  }
  const monthKeys = Object.keys(jobsByMonth).sort();
  const maxRevenuMonth = Math.max(...monthKeys.map(k => jobsByMonth[k].revenu), 1);

  // Top villes
  const villeCount: Record<string, number> = {};
  for (const j of filteredJobs) {
    villeCount[j.ville] = (villeCount[j.ville] || 0) + 1;
  }
  const topVilles = Object.entries(villeCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxVille = topVilles[0]?.[1] ?? 1;

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Rapports</h1>
          <p className="text-white/25 text-xs mt-0.5">Analyse de performance</p>
        </div>
        <button onClick={fetchAll} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all" title="Rafraîchir">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Period selector */}
            <div className="flex items-center gap-2">
              {(["30j", "90j", "6m", "12m", "tout"] as Periode[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    periode === p ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/30 hover:text-white/50"
                  }`}
                >
                  {p === "tout" ? "Tout" : p}
                </button>
              ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-2">Revenu jobs</p>
                <p className="text-2xl font-bold text-emerald-400">{fmt(revenuJobs)}</p>
                <p className="text-white/20 text-[10px] mt-1">{jobsAvecMontant.length} jobs facturés</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-2">Revenu moyen / job</p>
                <p className="text-2xl font-bold text-blue-400">{fmt(revenuMoyen)}</p>
                <p className="text-white/20 text-[10px] mt-1">{jobsCompletes.length} complétés</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-2">Factures payées</p>
                <p className="text-2xl font-bold text-emerald-400">{fmt(revenuFacture)}</p>
                <p className="text-white/20 text-[10px] mt-1">{facturesPayees.length} factures</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-2">En attente</p>
                <p className="text-2xl font-bold text-amber-400">{fmt(montantEnAttente)}</p>
                <p className="text-white/20 text-[10px] mt-1">{facturesEnAttente.length} en attente</p>
              </div>
            </div>

            {/* Taux conversion + Pipeline */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                  <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-3">Taux de conversion</p>
                  <div className="flex items-end gap-3">
                    <span className={`text-4xl font-black ${stats.tauxConversion >= 15 ? "text-emerald-400" : "text-amber-400"}`}>
                      {stats.tauxConversion}%
                    </span>
                    <span className="text-white/20 text-xs mb-1">{stats.leadsConvertis} / {stats.totalLeads} leads</span>
                  </div>
                  <div className="mt-3 w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${stats.tauxConversion >= 15 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(stats.tauxConversion, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                  <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-3">Pipeline</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-blue-400">{fmt(stats.pipelineActif)}</span>
                    <span className="text-white/20 text-xs mb-1">actif</span>
                  </div>
                  <p className="text-white/15 text-xs mt-2">Total : {fmt(stats.pipelineTotal)}</p>
                </div>
              </div>
            )}

            {/* Revenue chart by month */}
            {monthKeys.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Revenus par mois</h3>
                <div className="flex items-end gap-1 h-44">
                  {monthKeys.map(m => {
                    const d = jobsByMonth[m];
                    const pct = maxRevenuMonth > 0 ? (d.revenu / maxRevenuMonth) * 100 : 0;
                    const [, mo] = m.split("-");
                    const label = FR_MOIS[parseInt(mo) - 1]?.substring(0, 3) ?? mo;
                    return (
                      <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-default">
                        <div className="relative w-full flex justify-center">
                          <span className="absolute -top-5 text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {d.revenu > 0 ? fmt(d.revenu) : ""}
                          </span>
                          <div
                            className={`w-full max-w-[32px] rounded-t transition-all duration-300 ${d.revenu > 0 ? "bg-gradient-to-t from-emerald-600/80 to-emerald-400/60 group-hover:from-emerald-500 group-hover:to-emerald-300" : "bg-white/[0.03]"}`}
                            style={{ height: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-white/25 font-medium">{label}</span>
                        <span className="text-[9px] text-white/15">{d.total}j / {d.complete}c</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-white/15 text-[10px] mt-2 text-center">j = jobs total, c = complétés</p>
              </div>
            )}

            {/* Top villes */}
            {topVilles.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Top villes</h3>
                <div className="flex flex-col gap-2">
                  {topVilles.map(([ville, count]) => (
                    <div key={ville} className="flex items-center gap-3">
                      <span className="text-sm text-white/60 w-28 truncate shrink-0">{ville}</span>
                      <div className="flex-1 bg-white/[0.04] rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500/60 to-red-400/40 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${(count / maxVille) * 100}%` }}
                        >
                          <span className="text-[10px] text-white font-bold">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Résumé de la période</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Jobs total", value: filteredJobs.length, color: "text-white" },
                  { label: "Complétés", value: jobsCompletes.length, color: "text-emerald-400" },
                  { label: "En cours", value: filteredJobs.filter(j => j.statut === "en_cours").length, color: "text-amber-400" },
                  { label: "À faire", value: filteredJobs.filter(j => j.statut === "a_faire").length, color: "text-red-400" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-white/25 text-[10px] font-medium uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
