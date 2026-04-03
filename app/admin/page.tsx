"use client";

import { useState, useEffect, useCallback } from "react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  nouveau: { label: "Nouveau", color: "bg-blue-100 text-blue-700" },
  confirme: { label: "Confirmé", color: "bg-green-100 text-green-700" },
  termine: { label: "Terminé", color: "bg-gray-100 text-gray-500" },
  annule: { label: "Annulé", color: "bg-red-100 text-red-500" },
};

const FR_MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
const FR_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${FR_DAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]} · ${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseDescription(desc: string) {
  const lines = desc.split("\n");
  const result: Record<string, string> = {};
  for (const line of lines) {
    const idx = line.indexOf(": ");
    if (idx !== -1) {
      result[line.substring(0, idx).trim()] = line.substring(idx + 2).trim();
    }
  }
  return result;
}

interface Event {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  location: string;
  status: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchEvents = useCallback(async (pwd: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        headers: { "x-admin-password": pwd },
      });
      if (res.status === 401) { setAuthError(true); setAuthed(false); return; }
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    setLoading(true);
    const res = await fetch("/api/admin/events", {
      headers: { "x-admin-password": password },
    });
    if (res.status === 401) {
      setAuthError(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setEvents(data.events ?? []);
    setAuthed(true);
    setLoading(false);
  };

  const updateStatus = async (eventId: string, status: string) => {
    setUpdating(eventId);
    await fetch("/api/admin/status", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ eventId, status }),
    });
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status } : e));
    setUpdating(null);
  };

  // Auto-refresh every 60s
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => fetchEvents(password), 60000);
    return () => clearInterval(t);
  }, [authed, password, fetchEvents]);

  // Today's events
  const today = new Date().toISOString().split("T")[0];
  const todayEvents = events.filter((e) => e.start.startsWith(today));
  const upcomingEvents = events.filter((e) => !e.start.startsWith(today));

  const filtered = (list: Event[]) =>
    filter === "all" ? list : list.filter((e) => e.status === filter);

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
            disabled={loading}
            className="bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    );
  }

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
            onClick={() => fetchEvents(password)}
            className="text-white/40 hover:text-white transition-colors"
            title="Rafraîchir"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => { setAuthed(false); setPassword(""); setEvents([]); }}
            className="text-white/40 hover:text-red-400 transition-colors text-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Aujourd'hui", value: todayEvents.length, color: "text-brand" },
            { label: "Nouveaux", value: events.filter(e => e.status === "nouveau").length, color: "text-blue-400" },
            { label: "Confirmés", value: events.filter(e => e.status === "confirme").length, color: "text-green-400" },
            { label: "Total 30j", value: events.length, color: "text-white" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "nouveau", "confirme", "termine", "annule"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === f ? "bg-brand text-white" : "bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              {f === "all" ? "Tous" : STATUS_LABELS[f].label}
            </button>
          ))}
        </div>

        {loading && <p className="text-white/40 text-center py-10">Chargement...</p>}

        {/* Today */}
        {!loading && (
          <>
            <section>
              <h2 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Aujourd&apos;hui</h2>
              {filtered(todayEvents).length === 0 ? (
                <p className="text-white/20 text-sm py-4">Aucune réservation aujourd&apos;hui</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered(todayEvents).map((e) => (
                    <EventCard key={e.id} event={e} onStatusChange={updateStatus} updating={updating} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">À venir — 30 jours</h2>
              {filtered(upcomingEvents).length === 0 ? (
                <p className="text-white/20 text-sm py-4">Aucune réservation à venir</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered(upcomingEvents).map((e) => (
                    <EventCard key={e.id} event={e} onStatusChange={updateStatus} updating={updating} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onStatusChange, updating }: {
  event: Event;
  onStatusChange: (id: string, status: string) => void;
  updating: string | null;
}) {
  const info = parseDescription(event.description);
  const status = STATUS_LABELS[event.status] ?? STATUS_LABELS.nouveau;
  const isUpdating = updating === event.id;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-white">{event.summary}</p>
          <p className="text-white/40 text-sm mt-0.5">{formatDate(event.start)}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${status.color}`}>
          {status.label}
        </span>
      </div>

      {event.location && (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand hover:underline flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
        </a>
      )}

      {(info["Téléphone"] || info["Courriel"]) && (
        <div className="flex flex-wrap gap-3">
          {info["Téléphone"] && (
            <a href={`tel:${info["Téléphone"]}`} className="text-sm text-white/70 hover:text-white flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {info["Téléphone"]}
            </a>
          )}
          {info["Courriel"] && (
            <a href={`mailto:${info["Courriel"]}`} className="text-sm text-white/70 hover:text-white flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {info["Courriel"]}
            </a>
          )}
        </div>
      )}

      {/* Status buttons */}
      <div className="flex gap-2 flex-wrap pt-1">
        {Object.entries(STATUS_LABELS).map(([key, val]) => (
          <button
            key={key}
            disabled={isUpdating || event.status === key}
            onClick={() => onStatusChange(event.id, key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
              event.status === key
                ? `${val.color} opacity-100`
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isUpdating && event.status !== key ? "..." : val.label}
          </button>
        ))}
      </div>
    </div>
  );
}
