import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabase();

  const [clientRes, jobsRes, facturesRes, soumissionsRes, notesRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("jobs").select("*").eq("client_id", id).order("date", { ascending: false }),
    supabase.from("factures").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("soumissions_crm").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("notes_client").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  if (clientRes.error) {
    return NextResponse.json({ error: clientRes.error.message }, { status: 404 });
  }

  // Merge into timeline
  type TimelineItem = { type: string; date: string; data: Record<string, unknown> };
  const timeline: TimelineItem[] = [];

  for (const j of jobsRes.data ?? []) {
    timeline.push({ type: "job", date: j.date || j.created_at, data: j });
  }
  for (const f of facturesRes.data ?? []) {
    timeline.push({ type: "facture", date: f.created_at, data: f });
  }
  for (const s of soumissionsRes.data ?? []) {
    timeline.push({ type: "soumission", date: s.created_at, data: s });
  }
  for (const n of notesRes.data ?? []) {
    timeline.push({ type: "note", date: n.created_at, data: n });
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({
    client: clientRes.data,
    timeline,
    counts: {
      jobs: jobsRes.data?.length ?? 0,
      factures: facturesRes.data?.length ?? 0,
      soumissions: soumissionsRes.data?.length ?? 0,
      notes: notesRes.data?.length ?? 0,
    },
  });
}
