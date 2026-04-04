import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { texte } = await req.json();
    if (!texte) return NextResponse.json({ error: "Texte manquant" }, { status: 400 });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Extrait les informations de ce texte dicté et retourne UNIQUEMENT un objet JSON valide, rien d'autre.

Texte : "${texte}"

Retourne exactement ce format JSON (null si info absente) :
{
  "nom": "Prénom Nom ou null",
  "telephone": "numéro ou null",
  "ville": "ville ou null",
  "probleme": "description du problème ou null",
  "adresse": "adresse ou null",
  "notes": "autres infos pertinentes ou null"
}`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Extraction échouée" }, { status: 500 });

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[extraire-client] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
