"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const MOT_DE_PASSE = "l1a2m3B5";
const FR_MOIS_COURT = ["jan", "fev", "mar", "avr", "mai", "jun", "jul", "aou", "sep", "oct", "nov", "dec"];

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
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuthed(true);
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      setStats(await res.json());
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
    } else { setAuthError(true); }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <div className="bg-[#13131a] border border-white/[0.06] rounded-2xl p-8 flex flex-col gap-5 shadow-2xl">
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-white font-bold text-xl tracking-tight">Experts Portes de Garage</h1>
                <p className="text-white/25 text-xs mt-1 uppercase tracking-[0.15em]">Espace Admin</p>
              </div>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:bg-white/[0.06] text-[16px] transition-all"
              autoFocus
            />
            {authError && <p className="text-red-400 text-sm text-center -mt-2">Mot de passe incorrect</p>}
            <button type="submit" className="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3.5 rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]">
              Se connecter
            </button>
          </div>
        </form>
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Dashboard</h1>
          <p className="text-white/25 text-xs mt-0.5">Vue d&apos;ensemble de ton activite</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchStats()}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all"
            title="Rafraichir"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { setAuthed(false); setPassword(""); sessionStorage.removeItem("dicter_auth"); }}
            className="text-white/20 hover:text-red-400 transition-colors text-xs font-medium px-3 py-2"
          >
            Deconnexion
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {loadingStats ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : stats ? (() => {
          const mois = Object.keys(stats.revenusMensuels);
          const maxRevenu = Math.max(...Object.values(stats.revenusMensuels), 1);

          return (
            <>
              {/* KPIs row 1 — Revenue */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Revenu total", value: fmt(stats.revenuTotal), accent: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                  { label: "Revenu moyen / job", value: fmt(stats.revenuMoyen), accent: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                  { label: "Taux de conversion", value: `${stats.tauxConversion}%`, accent: stats.tauxConversion >= 15 ? "from-emerald-500/20 to-emerald-500/5" : "from-amber-500/20 to-amber-500/5", border: stats.tauxConversion >= 15 ? "border-emerald-500/20" : "border-amber-500/20", text: stats.tauxConversion >= 15 ? "text-emerald-400" : "text-amber-400", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> },
                  { label: "Pipeline actif", value: fmt(stats.pipelineActif), accent: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20", text: "text-blue-400", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /> },
                ].map((s) => (
                  <div key={s.label} className={`relative overflow-hidden bg-gradient-to-br ${s.accent} border ${s.border} rounded-2xl p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center ${s.text}`}>
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>{s.icon}</svg>
                      </div>
                    </div>
                    <p className={`text-2xl font-bold tracking-tight ${s.text}`}>{s.value}</p>
                    <p className="text-white/30 text-[11px] font-medium mt-1 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* KPIs row 2 — Activity */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Leads actifs", value: stats.leadsActifs, color: "text-blue-400", dot: "bg-blue-400" },
                  { label: "Convertis", value: stats.leadsConvertis, color: "text-emerald-400", dot: "bg-emerald-400" },
                  { label: "Jobs a faire", value: stats.jobsAFaire, color: "text-red-400", dot: "bg-red-400" },
                  { label: "Completes", value: stats.jobsCompletes, color: "text-emerald-400", dot: "bg-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className="text-white/30 text-[10px] font-medium uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue chart */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold text-sm">Revenus mensuels</h3>
                    <span className="text-emerald-400 text-xs font-bold">{fmt(stats.revenuTotal)}</span>
                  </div>
                  <div className="flex items-end gap-1 h-40">
                    {mois.map(m => {
                      const val = stats.revenusMensuels[m];
                      const pct = maxRevenu > 0 ? (val / maxRevenu) * 100 : 0;
                      const [y, mo] = m.split("-");
                      const label = FR_MOIS_COURT[parseInt(mo) - 1];
                      return (
                        <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-default">
                          <div className="relative w-full flex justify-center">
                            <span className="absolute -top-5 text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {val > 0 ? fmt(val) : ""}
                            </span>
                            <div
                              className={`w-full max-w-[32px] rounded-t transition-all duration-300 ${val > 0 ? "bg-gradient-to-t from-emerald-600/80 to-emerald-400/60 group-hover:from-emerald-500 group-hover:to-emerald-300" : "bg-white/[0.03]"}`}
                              style={{ height: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-white/25 font-medium">{label}</span>
                          <span className="text-[8px] text-white/15">{y.slice(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leads vs Jobs chart */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">Leads vs Jobs</h3>
                    <div className="flex gap-3">
                      <span className="text-[10px] text-blue-400 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/70" /> Leads</span>
                      <span className="text-[10px] text-red-400 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/70" /> Jobs</span>
                    </div>
                  </div>
                  {(() => {
                    const maxVal = Math.max(...Object.values(stats.leadsMensuels), ...Object.values(stats.jobsMensuels), 1);
                    return (
                      <div className="flex items-end gap-1 h-40 mt-3">
                        {mois.map(m => {
                          const leads = stats.leadsMensuels[m];
                          const jobs = stats.jobsMensuels[m];
                          const pctL = (leads / maxVal) * 100;
                          const pctJ = (jobs / maxVal) * 100;
                          const [, mo] = m.split("-");
                          const label = FR_MOIS_COURT[parseInt(mo) - 1];
                          return (
                            <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-default">
                              <div className="flex gap-0.5 items-end h-full w-full justify-center">
                                <div className="w-1/2 max-w-[14px] bg-blue-500/50 rounded-t-sm transition-all group-hover:bg-blue-400/70" style={{ height: `${Math.max(pctL, 3)}%` }} title={`${leads} leads`} />
                                <div className="w-1/2 max-w-[14px] bg-red-500/50 rounded-t-sm transition-all group-hover:bg-red-400/70" style={{ height: `${Math.max(pctJ, 3)}%` }} title={`${jobs} jobs`} />
                              </div>
                              <span className="text-[9px] text-white/25 font-medium">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/leads" className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Leads</p>
                      <p className="text-white/25 text-xs">{stats.leadsActifs} actifs</p>
                    </div>
                  </div>
                  <p className="text-blue-400/60 text-xs font-medium">{fmt(stats.pipelineActif)} en pipeline</p>
                </Link>
                <Link href="/admin/jobs" className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.06] hover:border-red-500/20 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Jobs</p>
                      <p className="text-white/25 text-xs">{stats.jobsAFaire} a faire</p>
                    </div>
                  </div>
                  <p className="text-red-400/60 text-xs font-medium">{stats.jobsEnCours} en cours</p>
                </Link>
              </div>
            </>
          );
        })() : (
          <p className="text-white/30 text-center py-20">Erreur de chargement</p>
        )}
      </div>
    </div>
  );
}
