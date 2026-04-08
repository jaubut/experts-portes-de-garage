import { getSupabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("notes_client")
    .insert({
      client_id: body.client_id,
      contenu: body.contenu,
    })
    .select()
    .single();

  if (error) {
    console.error("[notes] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  const { id } = await req.json();

  const { error } = await supabase.from("notes_client").delete().eq("id", id);

  if (error) {
    console.error("[notes] DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
