"use client";

import { useState, useRef, useEffect } from "react";

const MOT_DE_PASSE = "l1a2m3B5";

type Statut = "idle" | "ecoute" | "traitement" | "revue" | "sauvegarde" | "succes" | "erreur";

interface ClientForm {
  nom: string;
  telephone: string;
  ville: string;
  probleme: string;
  adresse: string;
  notes: string;
}

const CHAMPS_REQUIS: (keyof ClientForm)[] = ["nom", "telephone", "ville", "probleme"];
const LABELS: Record<keyof ClientForm, string> = {
  nom: "Nom",
  telephone: "Téléphone",
  ville: "Ville",
  probleme: "Problème",
  adresse: "Adresse",
  notes: "Notes",
};

export default function DicterPage() {
  const [autentifie, setAutentifie] = useState(false);
  const [mdp, setMdp] = useState("");
  const [mdpErreur, setMdpErreur] = useState(false);

  const [statut, setStatut] = useState<Statut>("idle");
  const [transcription, setTranscription] = useState("");
  const [texteManuel, setTexteManuel] = useState("");
  const [form, setForm] = useState<ClientForm>({ nom: "", telephone: "", ville: "", probleme: "", adresse: "", notes: "" });
  const [champVide, setChampVide] = useState<Set<keyof ClientForm>>(new Set());
  const [message, setMessage] = useState("");
  const [modeTexte, setModeTexte] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptionRef = useRef("");

  useEffect(() => {
    const saved = sessionStorage.getItem("dicter_auth");
    if (saved === MOT_DE_PASSE) setAutentifie(true);
  }, []);

  function soumettreMdp(e: React.FormEvent) {
    e.preventDefault();
    if (mdp === MOT_DE_PASSE) {
      sessionStorage.setItem("dicter_auth", MOT_DE_PASSE);
      setAutentifie(true);
    } else {
      setMdpErreur(true);
      setMdp("");
    }
  }

  function demarrerEcoute() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setModeTexte(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-CA";
    recognition.continuous = false;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const texte = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscription(texte);
      transcriptionRef.current = texte;
    };

    recognition.onend = () => {
      const texte = transcriptionRef.current;
      if (texte.trim()) {
        traiterTexte(texte);
      } else {
        setStatut("idle");
      }
    };

    recognition.onerror = () => {
      setStatut("idle");
      setModeTexte(true);
    };

    recognitionRef.current = recognition;
    transcriptionRef.current = "";
    setTranscription("");
    setMessage("");
    setStatut("ecoute");
    recognition.start();
  }

  function arreterEcoute() {
    recognitionRef.current?.stop();
  }

  async function traiterTexte(texte: string) {
    setStatut("traitement");

    try {
      const res = await fetch("/api/extraire-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte }),
      });
      const extrait = await res.json();

      const nouveauForm: ClientForm = {
        nom: extrait.nom ?? "",
        telephone: extrait.telephone ?? "",
        ville: extrait.ville ?? "",
        probleme: extrait.probleme ?? "",
        adresse: extrait.adresse ?? "",
        notes: extrait.notes ?? "",
      };

      const manquants = new Set<keyof ClientForm>();
      for (const champ of CHAMPS_REQUIS) {
        if (!nouveauForm[champ]) manquants.add(champ);
      }

      setForm(nouveauForm);
      setChampVide(manquants);
      setStatut("revue");
    } catch {
      setStatut("erreur");
      setMessage("Erreur réseau. Vérifie ta connexion.");
    }
  }

  async function sauvegarder() {
    setStatut("sauvegarde");

    const payload: Record<string, string> = {
      nom: form.nom || "Inconnu",
      telephone: form.telephone || `temp-${Date.now()}`,
      ville: form.ville || "",
      probleme: form.probleme || "Non précisé",
    };
    if (form.adresse) payload.adresse = form.adresse;
    if (form.notes) payload.notes = form.notes;

    try {
      const save = await fetch("/api/client-rapide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await save.json();

      if (result.success) {
        setStatut("succes");
        setMessage(`${form.nom || "Inconnu"}${form.ville ? `, ${form.ville}` : ""}`);
      } else {
        setStatut("erreur");
        setMessage(result.error ?? "Erreur lors de la sauvegarde.");
      }
    } catch {
      setStatut("erreur");
      setMessage("Erreur réseau. Vérifie ta connexion.");
    }
  }

  function recommencer() {
    setStatut("idle");
    setTranscription("");
    setTexteManuel("");
    transcriptionRef.current = "";
    setForm({ nom: "", telephone: "", ville: "", probleme: "", adresse: "", notes: "" });
    setChampVide(new Set());
    setMessage("");
    setModeTexte(false);
  }

  function updateChamp(champ: keyof ClientForm, val: string) {
    setForm((f) => ({ ...f, [champ]: val }));
    if (val.trim()) {
      setChampVide((s) => { const n = new Set(s); n.delete(champ); return n; });
    }
  }

  // ── Écran connexion ───────────────────────────────────────────────────────
  if (!autentifie) {
    return (
      <div className="flex-1 bg-gray-950 flex items-center justify-center p-6">
        <form onSubmit={soumettreMdp} className="w-full max-w-sm">
          <p className="text-gray-400 text-sm text-center mb-2 uppercase tracking-widest">Experts Portes de Garage</p>
          <h1 className="text-white text-2xl font-bold text-center mb-8">Espace admin</h1>
          <input
            type="password"
            value={mdp}
            onChange={(e) => { setMdp(e.target.value); setMdpErreur(false); }}
            placeholder="Mot de passe"
            autoFocus
            className={`w-full bg-gray-800 text-white text-lg px-5 py-4 rounded-2xl border outline-none mb-4 ${
              mdpErreur ? "border-red-500" : "border-gray-700 focus:border-red-600"
            }`}
          />
          {mdpErreur && <p className="text-red-500 text-sm text-center mb-4">Mot de passe incorrect</p>}
          <button type="submit" className="w-full bg-red-600 text-white text-lg font-bold py-4 rounded-2xl active:bg-red-700 hover:bg-red-700 transition-colors">
            Entrer
          </button>
        </form>
      </div>
    );
  }

  // ── Écran de revue / édition ──────────────────────────────────────────────
  if (statut === "revue" || statut === "sauvegarde") {
    const manquants = [...champVide].filter((c) => CHAMPS_REQUIS.includes(c));
    return (
      <div className="flex-1 bg-gray-950 flex flex-col p-5 max-w-2xl mx-auto w-full pb-10">
        <h1 className="text-white text-xl font-bold text-center mb-4 mt-4">Vérifier les infos</h1>

        {manquants.length > 0 && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-2xl p-3 mb-4">
            <p className="text-yellow-400 text-sm font-semibold mb-1">Informations manquantes :</p>
            <p className="text-yellow-300 text-sm">{manquants.map((c) => LABELS[c]).join(", ")}</p>
            <p className="text-yellow-600 text-xs mt-1">Complète ou laisse vide si tu ne sais pas.</p>
          </div>
        )}

        {transcription ? (
          <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ce que tu as dit</p>
            <p className="text-gray-400 text-sm italic">{transcription}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {(Object.keys(LABELS) as (keyof ClientForm)[]).map((champ) => {
            const requis = CHAMPS_REQUIS.includes(champ);
            const manque = champVide.has(champ);
            const isWide = champ === "adresse" || champ === "notes" || champ === "probleme";
            return (
              <div key={champ} className={isWide ? "md:col-span-2" : ""}>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider mb-1">
                  <span className={manque ? "text-yellow-400" : "text-gray-500"}>{LABELS[champ]}</span>
                  {requis && <span className="text-gray-600 text-xs">(requis)</span>}
                  {manque && <span className="text-yellow-500 text-xs">← manquant</span>}
                </label>
                <input
                  type={champ === "telephone" ? "tel" : "text"}
                  value={form[champ]}
                  onChange={(e) => updateChamp(champ, e.target.value)}
                  placeholder={manque ? `Entre le ${LABELS[champ].toLowerCase()} ou laisse vide` : ""}
                  className={`w-full bg-gray-800 text-white text-base px-4 py-3 rounded-xl border outline-none ${
                    manque
                      ? "border-yellow-600 focus:border-yellow-400"
                      : "border-gray-700 focus:border-red-600"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={sauvegarder}
            disabled={statut === "sauvegarde"}
            className="flex-1 bg-red-600 text-white text-lg font-bold py-4 rounded-2xl active:bg-red-700 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {statut === "sauvegarde" ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={recommencer}
            className="flex-1 bg-gray-800 text-gray-400 text-base py-3 rounded-2xl active:bg-gray-700 hover:bg-gray-700 transition-colors"
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  // ── Écran principal ───────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-gray-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-2xl font-bold text-center mb-8">Saisie client rapide</h1>

      {statut === "succes" ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="bg-green-900/40 border border-green-700 rounded-2xl p-6 text-center w-full">
            <p className="text-green-400 text-xl font-bold mb-1">Client sauvegardé</p>
            <p className="text-green-300 text-base">{message}</p>
          </div>
          <button type="button" onClick={recommencer} className="w-full bg-red-600 text-white text-lg font-bold py-4 rounded-2xl active:bg-red-700 hover:bg-red-700 transition-colors">
            Nouveau client
          </button>
        </div>
      ) : statut === "erreur" ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="bg-red-900/40 border border-red-700 rounded-2xl p-6 text-center w-full">
            <p className="text-red-400 text-base font-semibold">{message}</p>
          </div>
          <button type="button" onClick={recommencer} className="w-full bg-gray-800 text-white text-lg font-bold py-4 rounded-2xl active:bg-gray-700 hover:bg-gray-700 transition-colors">
            Recommencer
          </button>
        </div>
      ) : modeTexte ? (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="bg-gray-800 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-3">Écris les infos du client :</p>
            <textarea
              value={texteManuel}
              onChange={(e) => setTexteManuel(e.target.value)}
              placeholder="Ex: Jean Tremblay, Granby, 450-555-1234, ressort cassé côté gauche"
              rows={4}
              autoFocus
              className="w-full bg-gray-700 text-white text-base px-4 py-3 rounded-xl border border-gray-600 focus:border-red-600 outline-none resize-none"
            />
          </div>
          <button
            type="button"
            onClick={() => texteManuel.trim() && traiterTexte(texteManuel)}
            disabled={!texteManuel.trim() || statut === "traitement"}
            className="w-full bg-red-600 text-white text-lg font-bold py-4 rounded-2xl active:bg-red-700 hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {statut === "traitement" ? "Analyse..." : "Analyser"}
          </button>
          <button
            type="button"
            onClick={() => setModeTexte(false)}
            className="w-full bg-gray-800 text-gray-400 text-base py-3 rounded-2xl active:bg-gray-700 hover:bg-gray-700 transition-colors"
          >
            ← Retour au micro
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="flex justify-center">
            {statut === "idle" ? (
              <button
                type="button"
                onClick={demarrerEcoute}
                className="w-40 h-40 rounded-full bg-red-600 active:bg-red-700 hover:bg-red-700 flex flex-col items-center justify-center shadow-lg shadow-red-900/40 transition-colors"
              >
                <span className="text-6xl mb-1">🎙️</span>
                <span className="text-white text-sm font-semibold">Dicter</span>
              </button>
            ) : statut === "ecoute" ? (
              <button
                type="button"
                onClick={arreterEcoute}
                className="w-40 h-40 rounded-full bg-red-700 flex flex-col items-center justify-center shadow-lg shadow-red-900/60 animate-pulse"
              >
                <span className="text-6xl mb-1">⏹️</span>
                <span className="text-white text-sm font-semibold">Arrêter</span>
              </button>
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-800 flex flex-col items-center justify-center">
                <span className="text-5xl mb-2">⚙️</span>
                <span className="text-gray-400 text-sm">Analyse...</span>
              </div>
            )}
          </div>

          {statut === "ecoute" && (
            <div className="bg-gray-800 rounded-2xl p-4 text-center w-full">
              <p className="text-gray-400 text-sm">
                {transcription || "Je t\u2019écoute\u2026 parle maintenant"}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setModeTexte(true)}
            className="w-full bg-gray-800 text-gray-400 text-base py-3 rounded-2xl active:bg-gray-700 hover:bg-gray-700 transition-colors"
          >
            ✏️ Écrire à la place
          </button>

          <p className="text-gray-600 text-sm text-center leading-relaxed">
            Appuie sur le micro et dicte :<br />
            <span className="text-gray-500 italic">&ldquo;Jean Tremblay, Granby, 450-555-1234, ressort cassé&rdquo;</span>
          </p>
        </div>
      )}
    </div>
  );
}
