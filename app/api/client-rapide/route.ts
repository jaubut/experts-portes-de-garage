import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nom, telephone, courriel, adresse, ville, probleme, notes } = body;

    if (!nom || !telephone || !ville || !probleme) {
      return NextResponse.json(
        { error: "Champs requis manquants : nom, telephone, ville, probleme" },
        { status: 400 }
      );
    }

    const { data: client, error } = await getSupabase()
      .from("clients")
      .upsert(
        {
          nom,
          telephone,
          courriel: courriel || null,
          adresse: adresse || null,
          ville,
          probleme,
          notes: notes || null,
          statut: "nouveau",
        },
        { onConflict: "telephone" }
      )
      .select()
      .single();

    if (error) {
      console.error("[client-rapide] supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, client });
  } catch (err) {
    console.error("[client-rapide] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
