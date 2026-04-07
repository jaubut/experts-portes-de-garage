"use client";

import { useState, useEffect, useCallback } from "react";

const MOT_DE_PASSE = "l1a2m3B5";
const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MOIS_NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const STATUT_DOT: Record<string, string> = {
  a_faire: "bg-red-400",
  en_cours: "bg-amber-400",
  complete: "bg-emerald-400",
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

export default function CalendrierPage() {
  const [authed, setAuthed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const jobsByDate: Record<string, Job[]> = {};
  for (const job of jobs) {
    if (!jobsByDate[job.date]) jobsByDate[job.date] = [];
    jobsByDate[job.date].push(job);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function dayKey(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }
  function goToday() {
    setCurrentDate(new Date());
    setSelectedDay(todayStr);
  }

  const selectedJobs = selectedDay ? (jobsByDate[selectedDay] ?? []) : [];

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Calendrier</h1>
          <p className="text-white/25 text-xs mt-0.5">Vue mensuelle des jobs</p>
        </div>
        <button onClick={goToday} className="text-xs font-medium px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
          Aujourd&apos;hui
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-bold">{MOIS_NOMS[month]} {year}</h2>
              <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden">
              {/* Day headers */}
              {JOURS.map(j => (
                <div key={j} className="bg-white/[0.03] py-2 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                  {j}
                </div>
              ))}

              {/* Day cells */}
              {cells.map((d, i) => {
                if (d === null) return <div key={`e-${i}`} className="bg-[#0b0b10] min-h-[80px]" />;
                const key = dayKey(d);
                const dayJobs = jobsByDate[key] ?? [];
                const isToday = key === todayStr;
                const isSelected = key === selectedDay;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(isSelected ? null : key)}
                    className={`bg-[#0b0b10] min-h-[80px] p-2 text-left transition-all hover:bg-white/[0.04] ${
                      isSelected ? "ring-2 ring-red-500/50 bg-white/[0.04]" : ""
                    }`}
                  >
                    <span className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full ${
                      isToday ? "bg-red-500 text-white" : "text-white/50"
                    }`}>
                      {d}
                    </span>
                    {dayJobs.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayJobs.slice(0, 3).map(job => (
                          <div key={job.id} className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUT_DOT[job.statut] ?? "bg-white/20"}`} />
                            <span className="text-[10px] text-white/50 truncate">{job.nom}</span>
                          </div>
                        ))}
                        {dayJobs.length > 3 && (
                          <span className="text-[9px] text-white/25 pl-2.5">+{dayJobs.length - 3} autres</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected day detail */}
            {selectedDay && (
              <div className="mt-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3">
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
                  <span className="text-white/25 ml-2 text-xs">{selectedJobs.length} job{selectedJobs.length !== 1 ? "s" : ""}</span>
                </h3>
                {selectedJobs.length === 0 ? (
                  <p className="text-white/25 text-sm">Aucun job cette journée</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedJobs.map(job => (
                      <div key={job.id} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
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
                    ))}
                  </div>
                )}
              </div>
            )}

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
