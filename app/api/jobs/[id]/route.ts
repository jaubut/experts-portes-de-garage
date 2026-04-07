import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = getSupabase();
  const body = await req.json();

  console.log(`[PATCH jobs/${id}] payload:`, JSON.stringify(body));

  const { data, error } = await supabase
    .from("jobs")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`[PATCH jobs/${id}] ERROR:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log(`[PATCH jobs/${id}] OK — saved:`, JSON.stringify(data));
  return NextResponse.json(data);
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = getSupabase();

  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
