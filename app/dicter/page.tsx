"use client";

import { useState, useRef, useEffect } from "react";

const MOT_DE_PASSE = "epg2024";

type Statut = "idle" | "ecoute" | "traitement" | "succes" | "erreur";

interface ClientExtrait {
  nom: string | null;
  telephone: string | null;
  ville: string | null;
  probleme: string | null;
  adresse: string | null;
  notes: string | null;
}

export default function DicterPage() {
  const [autentifie, setAutentifie] = useState(false);
  const [mdp, setMdp] = useState("");
  const [mdpErreur, setMdpErreur] = useState(false);

  const [statut, setStatut] = useState<Statut>("idle");
  const [transcription, setTranscription] = useState("");
  const [client, setClient] = useState<ClientExtrait | null>(null);
  const [message, setMessage] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

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
      setMessage("Ton navigateur ne supporte pas la reconnaissance vocale. Utilise Chrome ou Safari.");
      setStatut("erreur");
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
    };

    recognition.onend = () => {
      if (transcription.trim()) {
        traiterTexte(transcription);
      } else {
        setStatut("idle");
      }
    };

    recognition.onerror = () => {
      setStatut("erreur");
      setMessage("Erreur micro. Vérifie les permissions.");
    };

    recognitionRef.current = recognition;
    setTranscription("");
    setClient(null);
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
      const extrait: ClientExtrait = await res.json();
      setClient(extrait);

      if (!extrait.nom && !extrait.telephone) {
        setStatut("erreur");
        setMessage("Impossible d'extraire les infos. Réessaie en parlant plus clairement.");
        return;
      }

      const payload: Record<string, string> = {
        nom: extrait.nom ?? "Inconnu",
        telephone: extrait.telephone ?? `temp-${Date.now()}`,
        ville: extrait.ville ?? "",
        probleme: extrait.probleme ?? "Non précisé",
      };
      if (extrait.adresse) payload.adresse = extrait.adresse;
      if (extrait.notes) payload.notes = extrait.notes;

      const save = await fetch("/api/client-rapide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await save.json();

      if (result.success) {
        setStatut("succes");
        setMessage(`Client sauvegardé — ${extrait.nom ?? "Inconnu"}, ${extrait.ville ?? ""}`);
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
    setClient(null);
    setMessage("");
  }

  // ── Écran de connexion ────────────────────────────────────────────────────
  if (!autentifie) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <form onSubmit={soumettreMdp} className="w-full max-w-sm">
          <p className="text-gray-400 text-sm text-center mb-2 uppercase tracking-widest">Experts Portes de Garage</p>
          <h1 className="text-white text-2xl font-bold text-center mb-8">Saisie vocale</h1>
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
          <button
            type="submit"
            className="w-full bg-red-600 text-white text-lg font-bold py-4 rounded-2xl active:bg-red-700"
          >
            Entrer
          </button>
        </form>
      </div>
    );
  }

  // ── Interface principale ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-5 max-w-lg mx-auto">
      <p className="text-gray-500 text-xs text-center uppercase tracking-widest mt-4 mb-1">Experts Portes de Garage</p>
      <h1 className="text-white text-xl font-bold text-center mb-8">Saisie client rapide</h1>

      {/* Bouton micro */}
      <div className="flex justify-center mb-8">
        {statut === "idle" || statut === "succes" || statut === "erreur" ? (
          <button
            type="button"
            onClick={statut === "succes" || statut === "erreur" ? recommencer : demarrerEcoute}
            className="w-36 h-36 rounded-full bg-red-600 active:bg-red-700 flex flex-col items-center justify-center shadow-lg shadow-red-900/40"
          >
            <span className="text-5xl mb-1">🎙️</span>
            <span className="text-white text-sm font-semibold">
              {statut === "succes" || statut === "erreur" ? "Recommencer" : "Dicter"}
            </span>
          </button>
        ) : statut === "ecoute" ? (
          <button
            type="button"
            onClick={arreterEcoute}
            className="w-36 h-36 rounded-full bg-red-700 flex flex-col items-center justify-center shadow-lg shadow-red-900/60 animate-pulse"
          >
            <span className="text-5xl mb-1">⏹️</span>
            <span className="text-white text-sm font-semibold">Arrêter</span>
          </button>
        ) : (
          <div className="w-36 h-36 rounded-full bg-gray-800 flex flex-col items-center justify-center">
            <span className="text-4xl mb-1 animate-spin">⚙️</span>
            <span className="text-gray-400 text-sm">Analyse...</span>
          </div>
        )}
      </div>

      {/* Transcription */}
      {transcription ? (
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Transcription</p>
          <p className="text-white text-base leading-relaxed">{transcription}</p>
        </div>
      ) : statut === "ecoute" ? (
        <div className="bg-gray-800 rounded-2xl p-4 mb-4 text-center">
          <p className="text-gray-400 text-sm">Je t&apos;écoute... parle maintenant</p>
        </div>
      ) : null}

      {/* Infos extraites */}
      {client && (
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Infos extraites</p>
          <div className="space-y-2">
            {[
              { label: "Nom", val: client.nom },
              { label: "Téléphone", val: client.telephone },
              { label: "Ville", val: client.ville },
              { label: "Problème", val: client.probleme },
              { label: "Adresse", val: client.adresse },
              { label: "Notes", val: client.notes },
            ].map(({ label, val }) =>
              val ? (
                <div key={label} className="flex gap-3">
                  <span className="text-gray-500 text-sm w-24 shrink-0">{label}</span>
                  <span className="text-white text-sm">{val}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Message résultat */}
      {message && (
        <div className={`rounded-2xl p-4 text-center ${
          statut === "succes" ? "bg-green-900/40 border border-green-700" : "bg-red-900/40 border border-red-700"
        }`}>
          <p className={`text-base font-semibold ${statut === "succes" ? "text-green-400" : "text-red-400"}`}>
            {statut === "succes" ? "✅" : "❌"} {message}
          </p>
        </div>
      )}

      {/* Instructions */}
      {statut === "idle" && !transcription && (
        <div className="mt-auto pt-8">
          <p className="text-gray-600 text-sm text-center leading-relaxed">
            Appuie sur le micro et dicte :<br />
            <span className="text-gray-500 italic">&ldquo;Jean Tremblay, Granby, 450-555-1234, ressort cassé&rdquo;</span>
          </p>
        </div>
      )}
    </div>
  );
}
