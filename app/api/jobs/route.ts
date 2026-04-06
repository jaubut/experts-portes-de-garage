import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();

  // Chercher les jobs des 30 derniers jours + futurs
  const depuis = new Date();
  depuis.setDate(depuis.getDate() - 30);

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .gte("date", depuis.toISOString().split("T")[0])
    .order("date", { ascending: true })
    .order("heure", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      nom: body.nom,
      telephone: body.telephone,
      adresse: body.adresse,
      ville: body.ville,
      date: body.date,
      heure: body.heure || null,
      statut: "a_faire",
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
