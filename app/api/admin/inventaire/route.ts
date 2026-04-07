import { getSupabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("inventaire")
    .select("*")
    .order("categorie", { ascending: true });

  if (error) {
    console.error("[inventaire] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("inventaire")
    .insert({
      nom: body.nom,
      categorie: body.categorie,
      quantite: body.quantite ?? 0,
      seuil_min: body.seuil_min ?? 2,
      prix_unitaire: body.prix_unitaire ?? 0,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[inventaire] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from("inventaire")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[inventaire] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  const { id } = await req.json();

  const { error } = await supabase.from("inventaire").delete().eq("id", id);

  if (error) {
    console.error("[inventaire] DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
