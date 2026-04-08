import { getSupabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("checklists")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[checklists] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("checklists")
    .insert({
      nom: body.nom,
      items: body.items || [],
    })
    .select()
    .single();

  if (error) {
    console.error("[checklists] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from("checklists")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[checklists] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  const { id } = await req.json();

  const { error } = await supabase.from("checklists").delete().eq("id", id);

  if (error) {
    console.error("[checklists] DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
