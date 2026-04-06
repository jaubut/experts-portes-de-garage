"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
}

export default function LeadsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [mdp, setMdp] = useState("");
  const [mdpErreur, setMdpErreur] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<StatutLead | "">("");
  const [editOuvert, setEditOuvert] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);

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

  function ouvrirEdit(client: Client) {
    setEditOuvert(client.id);
    setEditForm({
      nom: client.nom,
      telephone: client.telephone,
      courriel: client.courriel ?? "",
      adresse: client.adresse ?? "",
      ville: client.ville,
      probleme: client.probleme,
      notes: client.notes ?? "",
    });
  }

  async function sauvegarderEdit(client: Client) {
    setSaving(true);
    const payload = {
      nom: editForm.nom,
      telephone: editForm.telephone,
      courriel: editForm.courriel || null,
      adresse: editForm.adresse || null,
      ville: editForm.ville,
      probleme: editForm.probleme,
      notes: editForm.notes || null,
    };
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, ...payload } as Client : c));
    setEditOuvert(null);
    setSaving(false);
  }

  async function supprimerClient(id: string) {
    if (!confirm("Supprimer ce client?")) return;
    setClients((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
  }

  function transfererVersJob(client: Client) {
    sessionStorage.setItem("job_prefill", JSON.stringify({
      nom: client.nom,
      telephone: client.telephone,
      adresse: client.adresse ?? "",
      ville: client.ville,
    }));
    changerStatut(client, "job_planifie");
    router.push("/dicter/jobs");
  }

  if (!auth) {
    return (
      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center px-4">
        <form onSubmit={soumettreMdp} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <p className="text-gray-400 text-sm text-center mb-2 uppercase tracking-widest">Experts Portes de Garage</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6 text-center">Espace admin</h1>
          <input type="password" value={mdp} onChange={(e) => { setMdp(e.target.value); setMdpErreur(false); }} placeholder="Mot de passe" autoFocus className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:border-red-600" />
          {mdpErreur && <p className="text-red-500 text-xs mb-3">Mot de passe incorrect</p>}
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">Entrer</button>
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

      {/* Filtres pipeline — tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 overflow-x-auto shrink-0">
        <div className="flex gap-2 min-w-max md:max-w-7xl md:mx-auto">
          <button
            onClick={() => setFiltreStatut("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              !filtreStatut ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            Actifs ({clients.filter(c => c.statut !== "complete" && c.statut !== "sans_suite").length})
          </button>
          {PIPELINE_ORDER.map((s) => (
            <button key={s} onClick={() => setFiltreStatut(filtreStatut === s ? "" : s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                filtreStatut === s ? STATUT_COLORS[s] : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {STATUT_LABELS[s]} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-3">

        {/* Bannière urgente */}
        {!filtreStatut && urgents > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-semibold">
            🔔 {urgents} client{urgents > 1 ? "s" : ""} à contacter
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16">Chargement...</div>
        ) : clientsFiltres.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-semibold">Aucun lead actif</p>
            <p className="text-sm mt-1">Tout est traité</p>
          </div>
        ) : (
          clientsFiltres.map((client) => (
            <div key={client.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
              client.statut === "complete" || client.statut === "sans_suite" ? "opacity-40" : ""
            }`}>

              {editOuvert !== client.id ? (
                <>
                  {/* Carte principale */}
                  <div className="p-4">
                    {/* Ligne 1 — nom + statut + date */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[#1a1a1a] text-base truncate">{client.nom}</span>
                        <span className="text-xs text-gray-300 shrink-0">{formatDate(client.created_at)}</span>
                      </div>
                      <button
                        onClick={() => changerStatut(client, STATUT_NEXT[client.statut])}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ml-2 ${STATUT_COLORS[client.statut]}`}
                        title="Tap pour avancer le statut"
                      >
                        {STATUT_LABELS[client.statut]}
                      </button>
                    </div>

                    {/* Ligne 2 — téléphone (gros, tappable) */}
                    <a href={`tel:${client.telephone}`} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-2 group">
                      <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                      </svg>
                      <span className="text-red-700 font-bold text-sm">{client.telephone}</span>
                      <span className="text-red-400 text-xs ml-auto group-hover:text-red-600">Appeler →</span>
                    </a>

                    {/* Ligne 3 — ville + problème */}
                    <p className="text-sm text-gray-600 mb-0.5">
                      📍 {client.adresse ? `${client.adresse}, ` : ""}{client.ville}
                    </p>
                    <p className="text-sm text-gray-500 italic">{client.probleme}</p>
                    {client.notes && (
                      <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 italic">{client.notes}</p>
                    )}
                  </div>

                  {/* Barre d'actions */}
                  <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
                    <button
                      onClick={() => ouvrirEdit(client)}
                      className="flex items-center justify-center gap-1.5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <button
                      onClick={() => transfererVersJob(client)}
                      className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Créer job
                    </button>
                    <button
                      onClick={() => supprimerClient(client.id)}
                      className="flex items-center justify-center gap-1.5 py-3 text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </>
              ) : (
                /* Formulaire d'édition */
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1a1a1a]">Modifier — {client.nom}</h3>
                    <button onClick={() => setEditOuvert(null)} className="text-gray-400 text-sm hover:text-gray-600">✕ Annuler</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: "nom", label: "Nom", type: "text" },
                      { key: "telephone", label: "Téléphone", type: "tel" },
                      { key: "adresse", label: "Adresse", type: "text" },
                      { key: "ville", label: "Ville", type: "text" },
                      { key: "probleme", label: "Problème", type: "text", wide: true },
                      { key: "courriel", label: "Courriel", type: "email" },
                    ].map(({ key, label, type, wide }) => (
                      <div key={key} className={wide ? "md:col-span-2" : ""}>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                        <input
                          type={type}
                          value={(editForm as Record<string, string>)[key] ?? ""}
                          onChange={e => setEditForm(f => ({...f, [key]: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Notes</label>
                      <textarea
                        value={editForm.notes ?? ""}
                        onChange={e => setEditForm(f => ({...f, notes: e.target.value}))}
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => sauvegarderEdit(client)}
                    disabled={saving}
                    className="w-full mt-4 bg-red-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
