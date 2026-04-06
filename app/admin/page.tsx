"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const MOT_DE_PASSE = "l1a2m3B5";

const FR_MOIS_COURT = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];

interface Stats {
  totalLeads: number; leadsActifs: number; leadsConvertis: number; tauxConversion: number;
  pipelineTotal: number; pipelineActif: number; revenuTotal: number; revenuMoyen: number;
  jobsAFaire: number; jobsEnCours: number; jobsCompletes: number;
  revenusMensuels: Record<string, number>; jobsMensuels: Record<string, number>; leadsMensuels: Record<string, number>;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) {
      setAuthed(true);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch { /* ignore */ }
    finally { setLoadingStats(false); }
  }, []);

  useEffect(() => { if (authed) fetchStats(); }, [authed, fetchStats]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === MOT_DE_PASSE) {
      sessionStorage.setItem("dicter_auth", password);
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-white font-bold text-xl">Admin</h1>
            <p className="text-white/40 text-sm">Experts Portes de Garage</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-brand text-[16px]"
            autoFocus
          />
          {authError && <p className="text-red-400 text-sm text-center">Mot de passe incorrect</p>}
          <button
            type="submit"
            className="bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors"
          >
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">Dashboard</h1>
          <p className="text-white/40 text-xs">Experts Portes de Garage</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats()}
            className="text-white/40 hover:text-white transition-colors"
            title="Rafraîchir"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => { setAuthed(false); setPassword(""); sessionStorage.removeItem("dicter_auth"); }}
            className="text-white/40 hover:text-red-400 transition-colors text-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8">
        {loadingStats ? (
          <p className="text-white/40 text-center py-10">Chargement...</p>
        ) : stats ? (() => {
          const mois = Object.keys(stats.revenusMensuels);
          const maxRevenu = Math.max(...Object.values(stats.revenusMensuels), 1);

          return (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Revenu total", value: fmt(stats.revenuTotal), color: "text-green-400" },
                  { label: "Revenu moyen / job", value: fmt(stats.revenuMoyen), color: "text-green-400" },
                  { label: "Taux de conversion", value: `${stats.tauxConversion}%`, color: stats.tauxConversion >= 15 ? "text-green-400" : "text-orange-400" },
                  { label: "Pipeline actif", value: fmt(stats.pipelineActif), color: "text-blue-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-white/40 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Activité */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Leads actifs", value: stats.leadsActifs, color: "text-blue-400" },
                  { label: "Leads convertis", value: stats.leadsConvertis, color: "text-green-400" },
                  { label: "Jobs à faire", value: stats.jobsAFaire, color: "text-red-400" },
                  { label: "Jobs complétés", value: stats.jobsCompletes, color: "text-green-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-white/40 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Graphique revenus mensuels */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4">Revenus mensuels</h3>
                <div className="flex items-end gap-1.5 h-48">
                  {mois.map(m => {
                    const val = stats.revenusMensuels[m];
                    const pct = maxRevenu > 0 ? (val / maxRevenu) * 100 : 0;
                    const [y, mo] = m.split("-");
                    const label = FR_MOIS_COURT[parseInt(mo) - 1];
                    return (
                      <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                        <div className="relative w-full flex justify-center">
                          <span className="absolute -top-6 text-[10px] text-green-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {val > 0 ? fmt(val) : ""}
                          </span>
                          <div
                            className={`w-full max-w-[40px] rounded-t-md transition-all ${val > 0 ? "bg-green-500/70 group-hover:bg-green-400" : "bg-white/5"}`}
                            style={{ height: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/40">{label}</span>
                        <span className="text-[9px] text-white/20">{y.slice(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Graphique leads vs jobs par mois */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-1">Leads vs Jobs par mois</h3>
                <div className="flex gap-4 mb-4">
                  <span className="text-xs text-blue-400 flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500/70 inline-block" /> Leads</span>
                  <span className="text-xs text-red-400 flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/70 inline-block" /> Jobs</span>
                </div>
                {(() => {
                  const maxVal = Math.max(...Object.values(stats.leadsMensuels), ...Object.values(stats.jobsMensuels), 1);
                  return (
                    <div className="flex items-end gap-1.5 h-36">
                      {mois.map(m => {
                        const leads = stats.leadsMensuels[m];
                        const jobs = stats.jobsMensuels[m];
                        const pctL = (leads / maxVal) * 100;
                        const pctJ = (jobs / maxVal) * 100;
                        const [, mo] = m.split("-");
                        const label = FR_MOIS_COURT[parseInt(mo) - 1];
                        return (
                          <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                            <div className="flex gap-0.5 items-end h-full w-full justify-center">
                              <div className="w-1/2 max-w-[18px] bg-blue-500/70 rounded-t-sm transition-all group-hover:bg-blue-400" style={{ height: `${Math.max(pctL, 2)}%` }} title={`${leads} leads`} />
                              <div className="w-1/2 max-w-[18px] bg-red-500/70 rounded-t-sm transition-all group-hover:bg-red-400" style={{ height: `${Math.max(pctJ, 2)}%` }} title={`${jobs} jobs`} />
                            </div>
                            <span className="text-[10px] text-white/40">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/leads" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
                  <p className="text-white font-bold">Leads</p>
                  <p className="text-white/40 text-xs mt-1">{stats.leadsActifs} actifs · {fmt(stats.pipelineActif)} pipeline</p>
                </Link>
                <Link href="/admin/jobs" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
                  <p className="text-white font-bold">Jobs</p>
                  <p className="text-white/40 text-xs mt-1">{stats.jobsAFaire} à faire · {stats.jobsEnCours} en cours</p>
                </Link>
              </div>
            </>
          );
        })() : (
          <p className="text-white/40 text-center py-10">Erreur de chargement</p>
        )}
      </div>
    </div>
  );
}
