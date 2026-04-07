import { getSupabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("factures")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[factures] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("factures")
    .insert({
      job_id: body.job_id,
      nom: body.nom,
      telephone: body.telephone,
      adresse: body.adresse,
      ville: body.ville,
      description: body.description,
      montant: body.montant,
      statut: body.statut || "brouillon",
    })
    .select()
    .single();

  if (error) {
    console.error("[factures] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from("factures")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[factures] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  const { id } = await req.json();

  const { error } = await supabase.from("factures").delete().eq("id", id);

  if (error) {
    console.error("[factures] DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
