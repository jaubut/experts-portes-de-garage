import { getSupabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("soumissions_crm")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[soumissions] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();

  // Auto-generate numero
  const now = new Date();
  const prefix = `S-${now.getFullYear()}-`;
  const { count } = await supabase
    .from("soumissions_crm")
    .select("*", { count: "exact", head: true })
    .like("numero", `${prefix}%`);
  const numero = `${prefix}${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data, error } = await supabase
    .from("soumissions_crm")
    .insert({
      client_id: body.client_id ?? null,
      numero,
      statut: body.statut || "brouillon",
      options: body.options,
      option_choisie: body.option_choisie ?? null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[soumissions] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from("soumissions_crm")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[soumissions] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  const { id } = await req.json();

  const { error } = await supabase.from("soumissions_crm").delete().eq("id", id);

  if (error) {
    console.error("[soumissions] DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
