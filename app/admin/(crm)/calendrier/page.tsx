"use client";

import { useState, useEffect, useCallback } from "react";

const MOT_DE_PASSE = "l1a2m3B5";
const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const JOURS_COMPLETS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS_NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const HEURES = Array.from({ length: 13 }, (_, i) => i + 7); // 7h à 19h

const STATUT_DOT: Record<string, string> = {
  a_faire: "bg-red-400",
  en_cours: "bg-amber-400",
  complete: "bg-emerald-400",
};

const STATUT_BG: Record<string, string> = {
  a_faire: "bg-red-500/10 border-red-500/20",
  en_cours: "bg-amber-500/10 border-amber-500/20",
  complete: "bg-emerald-500/10 border-emerald-500/20",
};

interface Job {
  id: string;
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  date: string;
  heure: string | null;
  statut: string;
  notes: string | null;
  montant: number | null;
}

type ViewMode = "mois" | "semaine" | "jour";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDays(d: Date): Date[] {
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    return dd;
  });
}

function heureToRow(heure: string | null): number | null {
  if (!heure) return null;
  const [h] = heure.split(":").map(Number);
  if (h < 7 || h > 19) return null;
  return h - 7;
}

export default function CalendrierPage() {
  const [authed, setAuthed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("mois");

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuthed(true);
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      if (res.ok) setJobs(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) fetchJobs(); }, [authed, fetchJobs]);

  if (!authed) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayStr = toDateStr(today);

  const jobsByDate: Record<string, Job[]> = {};
  for (const job of jobs) {
    if (!jobsByDate[job.date]) jobsByDate[job.date] = [];
    jobsByDate[job.date].push(job);
  }

  // Navigation
  function prev() {
    if (view === "mois") setCurrentDate(new Date(year, month - 1, 1));
    else if (view === "semaine") { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }
    else { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); }
    setSelectedDay(null);
  }
  function next() {
    if (view === "mois") setCurrentDate(new Date(year, month + 1, 1));
    else if (view === "semaine") { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }
    else { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); }
    setSelectedDay(null);
  }
  function goToday() { setCurrentDate(new Date()); setSelectedDay(todayStr); }

  function getTitle() {
    if (view === "mois") return `${MOIS_NOMS[month]} ${year}`;
    if (view === "jour") return currentDate.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
    const week = getWeekDays(currentDate);
    const first = week[0];
    const last = week[6];
    if (first.getMonth() === last.getMonth()) return `${first.getDate()} - ${last.getDate()} ${MOIS_NOMS[first.getMonth()]}`;
    return `${first.getDate()} ${MOIS_NOMS[first.getMonth()]?.substring(0, 3)} - ${last.getDate()} ${MOIS_NOMS[last.getMonth()]?.substring(0, 3)}`;
  }

  // Month view data
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) monthCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) monthCells.push(d);

  function dayKey(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const selectedJobs = selectedDay ? (jobsByDate[selectedDay] ?? []) : [];

  // Job detail card
  const JobDetail = ({ job }: { job: Job }) => (
    <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${STATUT_DOT[job.statut] ?? "bg-white/20"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{job.nom}</span>
          {job.heure && <span className="text-xs text-white/30">{job.heure}</span>}
        </div>
        <p className="text-white/40 text-xs mt-0.5">{job.adresse}, {job.ville}</p>
        {job.notes && <p className="text-white/25 text-xs mt-1 italic">{job.notes}</p>}
      </div>
      {job.montant && (
        <span className="text-emerald-400 text-sm font-bold shrink-0">
          {job.montant.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Calendrier</h1>
          <p className="text-white/25 text-xs mt-0.5">Planification des jobs</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden">
            {(["mois", "semaine", "jour"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  view === v ? "bg-red-500/20 text-red-400" : "text-white/30 hover:text-white/50"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={goToday} className="text-xs font-medium px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
            Aujourd&apos;hui
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prev} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-bold">{getTitle()}</h2>
              <button onClick={next} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* ========== MONTH VIEW ========== */}
            {view === "mois" && (
              <>
                <div className="grid grid-cols-7 gap-px bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden">
                  {JOURS.map(j => (
                    <div key={j} className="bg-white/[0.03] py-2 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">{j}</div>
                  ))}
                  {monthCells.map((d, i) => {
                    if (d === null) return <div key={`e-${i}`} className="bg-[#0b0b10] min-h-[80px]" />;
                    const key = dayKey(d);
                    const dayJobs = jobsByDate[key] ?? [];
                    const isToday = key === todayStr;
                    const isSelected = key === selectedDay;
                    return (
                      <button key={key} onClick={() => setSelectedDay(isSelected ? null : key)} className={`bg-[#0b0b10] min-h-[80px] p-2 text-left transition-all hover:bg-white/[0.04] ${isSelected ? "ring-2 ring-red-500/50 bg-white/[0.04]" : ""}`}>
                        <span className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full ${isToday ? "bg-red-500 text-white" : "text-white/50"}`}>{d}</span>
                        {dayJobs.length > 0 && (
                          <div className="mt-1 flex flex-col gap-0.5">
                            {dayJobs.slice(0, 3).map(job => (
                              <div key={job.id} className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUT_DOT[job.statut] ?? "bg-white/20"}`} />
                                <span className="text-[10px] text-white/50 truncate">{job.nom}</span>
                              </div>
                            ))}
                            {dayJobs.length > 3 && <span className="text-[9px] text-white/25 pl-2.5">+{dayJobs.length - 3}</span>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedDay && (
                  <div className="mt-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="font-semibold text-sm mb-3">
                      {new Date(selectedDay + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
                      <span className="text-white/25 ml-2 text-xs">{selectedJobs.length} job{selectedJobs.length !== 1 ? "s" : ""}</span>
                    </h3>
                    {selectedJobs.length === 0 ? <p className="text-white/25 text-sm">Aucun job</p> : (
                      <div className="flex flex-col gap-2">{selectedJobs.map(job => <JobDetail key={job.id} job={job} />)}</div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ========== WEEK VIEW ========== */}
            {view === "semaine" && (() => {
              const weekDays = getWeekDays(currentDate);
              return (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.06]">
                    <div className="p-2" />
                    {weekDays.map((d, i) => {
                      const ds = toDateStr(d);
                      const isToday = ds === todayStr;
                      return (
                        <div key={i} className={`p-2 text-center border-l border-white/[0.06] ${isToday ? "bg-red-500/5" : ""}`}>
                          <p className="text-[10px] text-white/30 uppercase">{JOURS[i]}</p>
                          <p className={`text-sm font-bold ${isToday ? "text-red-400" : "text-white/60"}`}>{d.getDate()}</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Hour rows */}
                  {HEURES.map(h => (
                    <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.04] min-h-[52px]">
                      <div className="p-1.5 text-[10px] text-white/20 text-right pr-2 pt-1">{h}:00</div>
                      {weekDays.map((d, di) => {
                        const ds = toDateStr(d);
                        const dayJobs = (jobsByDate[ds] ?? []).filter(j => {
                          const row = heureToRow(j.heure);
                          return row === h - 7;
                        });
                        const isToday = ds === todayStr;
                        return (
                          <div key={di} className={`border-l border-white/[0.04] p-0.5 ${isToday ? "bg-red-500/[0.02]" : ""}`}>
                            {dayJobs.map(job => (
                              <div key={job.id} className={`rounded-lg border px-1.5 py-1 mb-0.5 ${STATUT_BG[job.statut] ?? "bg-white/[0.03] border-white/[0.06]"}`}>
                                <p className="text-[10px] font-semibold text-white/70 truncate">{job.nom}</p>
                                <p className="text-[9px] text-white/30 truncate">{job.ville}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {/* Unscheduled (no heure) */}
                  {(() => {
                    const unscheduled = weekDays.map(d => {
                      const ds = toDateStr(d);
                      return (jobsByDate[ds] ?? []).filter(j => !j.heure || heureToRow(j.heure) === null);
                    });
                    const hasAny = unscheduled.some(u => u.length > 0);
                    if (!hasAny) return null;
                    return (
                      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-t border-white/[0.06]">
                        <div className="p-1.5 text-[9px] text-white/15 text-right pr-2 pt-2">Autre</div>
                        {unscheduled.map((uJobs, di) => (
                          <div key={di} className="border-l border-white/[0.04] p-0.5">
                            {uJobs.map(job => (
                              <div key={job.id} className={`rounded-lg border px-1.5 py-1 mb-0.5 ${STATUT_BG[job.statut] ?? "bg-white/[0.03] border-white/[0.06]"}`}>
                                <p className="text-[10px] font-semibold text-white/70 truncate">{job.nom}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* ========== DAY VIEW ========== */}
            {view === "jour" && (() => {
              const ds = toDateStr(currentDate);
              const dayJobs = jobsByDate[ds] ?? [];
              const isToday = ds === todayStr;
              const unscheduled = dayJobs.filter(j => !j.heure || heureToRow(j.heure) === null);

              return (
                <div className="flex flex-col gap-4">
                  {/* Day header */}
                  <div className={`text-center py-2 rounded-xl ${isToday ? "bg-red-500/5 border border-red-500/20" : "bg-white/[0.03] border border-white/[0.06]"}`}>
                    <p className={`text-sm font-bold ${isToday ? "text-red-400" : "text-white/60"}`}>
                      {JOURS_COMPLETS[currentDate.getDay()]} {currentDate.getDate()} {MOIS_NOMS[currentDate.getMonth()]}
                    </p>
                    <p className="text-white/20 text-xs">{dayJobs.length} job{dayJobs.length !== 1 ? "s" : ""}</p>
                  </div>

                  {/* Hour slots */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                    {HEURES.map(h => {
                      const hourJobs = dayJobs.filter(j => heureToRow(j.heure) === h - 7);
                      return (
                        <div key={h} className="flex border-b border-white/[0.04] min-h-[56px]">
                          <div className="w-16 shrink-0 p-2 text-xs text-white/20 text-right pr-3 pt-2 border-r border-white/[0.04]">
                            {h}:00
                          </div>
                          <div className="flex-1 p-1.5">
                            {hourJobs.map(job => (
                              <div key={job.id} className={`rounded-xl border p-3 mb-1 ${STATUT_BG[job.statut] ?? "bg-white/[0.03] border-white/[0.06]"}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${STATUT_DOT[job.statut]}`} />
                                    <span className="font-semibold text-sm">{job.nom}</span>
                                    {job.heure && <span className="text-xs text-white/30">{job.heure}</span>}
                                  </div>
                                  {job.montant && (
                                    <span className="text-emerald-400 text-xs font-bold">{job.montant.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}</span>
                                  )}
                                </div>
                                <p className="text-white/40 text-xs mt-1">{job.adresse}, {job.ville}</p>
                                {job.notes && <p className="text-white/20 text-xs mt-1 italic">{job.notes}</p>}
                                <div className="flex gap-2 mt-2">
                                  <a href={`tel:${job.telephone}`} className="text-[10px] text-white/30 hover:text-emerald-400 transition-colors">Appeler</a>
                                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${job.adresse}, ${job.ville}, QC`)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/30 hover:text-red-400 transition-colors">Maps</a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Unscheduled */}
                  {unscheduled.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                      <h4 className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Sans heure assignée</h4>
                      <div className="flex flex-col gap-2">
                        {unscheduled.map(job => <JobDetail key={job.id} job={job} />)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 justify-center">
              {[
                { label: "À faire", color: "bg-red-400" },
                { label: "En cours", color: "bg-amber-400" },
                { label: "Complété", color: "bg-emerald-400" },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-white/30">
                  <span className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
