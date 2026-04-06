"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function jobUrl(client: Client) {
  const params = new URLSearchParams({
    nom: client.nom,
    telephone: client.telephone,
    adresse: client.adresse ?? "",
    ville: client.ville,
  });
  return `/dicter/jobs?prefill=${encodeURIComponent(params.toString())}`;
}

export default function LeadsPage() {
  const [auth, setAuth] = useState(false);
  const [mdp, setMdp] = useState("");
  const [mdpErreur, setMdpErreur] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<StatutLead | "">("");
  const [noteOuverte, setNoteOuverte] = useState<string | null>(null);
  const [noteTexte, setNoteTexte] = useState("");
  const [savingNote, setSavingNote] = useState(false);

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
    if (mdp === MOT_DE_PASSE) {
      sessionStorage.setItem("dicter_auth", mdp);
      setAuth(true);
    } else {
      setMdpErreur(true);
    }
  }

  async function changerStatut(client: Client, newStatut: StatutLead) {
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, statut: newStatut } : c));
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut }),
    });
  }

  async function sauvegarderNote(client: Client) {
    setSavingNote(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: noteTexte }),
    });
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, notes: noteTexte } : c));
    setNoteOuverte(null);
    setSavingNote(false);
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <form onSubmit={soumettreMdp} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <p className="text-gray-400 text-sm text-center mb-2 uppercase tracking-widest">Experts Portes de Garage</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6 text-center">Espace admin</h1>
          <input
            type="password"
            value={mdp}
            onChange={(e) => { setMdp(e.target.value); setMdpErreur(false); }}
            placeholder="Mot de passe"
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:border-red-600"
          />
          {mdpErreur && <p className="text-red-500 text-xs mb-3">Mot de passe incorrect</p>}
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
            Entrer
          </button>
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
      {/* Sous-header */}
      <div className="bg-[#1a1a1a]/80 border-b border-white/10 px-5 py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/50 text-xs">
            {urgents > 0
              ? `${urgents} à contacter · ${counts.job_planifie ?? 0} job planifié`
              : `${clients.length} clients au total`}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:flex md:gap-6">

        {/* Sidebar */}
        <aside className="md:w-64 shrink-0 space-y-4 md:sticky md:top-6 md:self-start">

          {/* Pipeline stats */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h2 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wide mb-3">Pipeline</h2>
            <div className="space-y-2">
              {PIPELINE_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltreStatut(filtreStatut === s ? "" : s)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    filtreStatut === s ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${STATUT_COLORS[s]}`}>
                    {STATUT_LABELS[s]}
                  </span>
                  <span className="text-gray-500 font-bold">{counts[s] ?? 0}</span>
                </button>
              ))}
            </div>
            {filtreStatut && (
              <button
                onClick={() => setFiltreStatut("")}
                className="mt-3 text-red-600 text-xs font-semibold hover:underline w-full text-left"
              >
                Voir actifs seulement
              </button>
            )}
          </div>

        </aside>

        {/* Liste clients */}
        <main className="flex-1 mt-4 md:mt-0 space-y-3">
          {!filtreStatut && urgents > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-semibold">
              {urgents} client{urgents > 1 ? "s" : ""} à contacter aujourd&apos;hui
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-16">Chargement...</div>
          ) : clientsFiltres.length === 0 ? (
            <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-lg mb-2">Aucun lead actif</p>
              <p className="text-sm">Tous les clients ont été traités</p>
            </div>
          ) : (
            clientsFiltres.map((client) => (
              <div
                key={client.id}
                className={`bg-white rounded-xl border shadow-sm transition-opacity ${
                  client.statut === "complete" || client.statut === "sans_suite" ? "opacity-50" : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-[#1a1a1a]">{client.nom}</span>
                        <button
                          onClick={() => changerStatut(client, STATUT_NEXT[client.statut])}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${STATUT_COLORS[client.statut]}`}
                          title="Cliquer pour avancer dans le pipeline"
                        >
                          {STATUT_LABELS[client.statut]}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{client.ville}</p>
                      <p className="text-sm text-gray-500 mt-0.5 italic">{client.probleme}</p>
                      {client.notes && noteOuverte !== client.id && (
                        <p className="text-xs text-gray-400 mt-1 bg-gray-50 rounded px-2 py-1 italic">{client.notes}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">{formatDate(client.created_at)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`tel:${client.telephone}`}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Appeler"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => {
                          setNoteOuverte(noteOuverte === client.id ? null : client.id);
                          setNoteTexte(client.notes ?? "");
                        }}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Ajouter une note"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <Link
                        href={jobUrl(client)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        title="Créer un job pour ce client"
                        onClick={() => changerStatut(client, "job_planifie")}
                      >
                        + Job
                      </Link>
                    </div>
                  </div>

                  {/* Zone note */}
                  {noteOuverte === client.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <textarea
                        value={noteTexte}
                        onChange={(e) => setNoteTexte(e.target.value)}
                        placeholder="Ajoute une note..."
                        rows={2}
                        autoFocus
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => sauvegarderNote(client)}
                          disabled={savingNote}
                          className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {savingNote ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                        <button
                          onClick={() => setNoteOuverte(null)}
                          className="text-gray-400 text-xs hover:text-gray-600"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sélecteur statut manuel */}
                <div className="px-4 pb-3 flex gap-2 flex-wrap">
                  {PIPELINE_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={() => changerStatut(client, s)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-opacity ${
                        client.statut === s
                          ? `${STATUT_COLORS[s]} font-bold`
                          : "border-gray-200 text-gray-400 hover:border-gray-400"
                      }`}
                    >
                      {STATUT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
