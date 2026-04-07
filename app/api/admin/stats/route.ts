import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();

  const [clientsRes, jobsRes] = await Promise.all([
    supabase.from("clients").select("*"),
    supabase.from("jobs").select("*"),
  ]);

  const clients = clientsRes.data ?? [];
  const jobs = jobsRes.data ?? [];

  if (clientsRes.error) console.error("[stats] clients error:", clientsRes.error);
  if (jobsRes.error) console.error("[stats] jobs error:", jobsRes.error);
  console.log(`[stats] ${clients.length} clients, ${jobs.length} jobs`);

  // Pipeline valeur
  const pipelineTotal = clients.reduce((s, c) => s + (c.montant_estime ?? 0), 0);
  const pipelineActif = clients
    .filter(c => c.statut !== "complete" && c.statut !== "sans_suite")
    .reduce((s, c) => s + (c.montant_estime ?? 0), 0);

  // Taux de conversion
  const totalLeads = clients.length;
  const leadsConvertis = clients.filter(c => c.statut === "complete" || c.statut === "job_planifie").length;
  const tauxConversion = totalLeads > 0 ? Math.round((leadsConvertis / totalLeads) * 100) : 0;

  // Revenus et jobs complétés
  const jobsCompletesAll = jobs.filter(j => j.statut === "complete");
  const jobsAvecMontant = jobsCompletesAll.filter(j => j.montant);
  const revenuTotal = jobsAvecMontant.reduce((s, j) => s + (j.montant ?? 0), 0);
  const revenuMoyen = jobsAvecMontant.length > 0 ? Math.round(revenuTotal / jobsAvecMontant.length) : 0;

  // Revenus par mois (12 derniers mois)
  const revenusMensuels: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenusMensuels[key] = 0;
  }
  for (const job of jobsAvecMontant) {
    const key = job.date?.substring(0, 7);
    if (key && key in revenusMensuels) {
      revenusMensuels[key] += job.montant ?? 0;
    }
  }

  // Jobs par mois
  const jobsMensuels: Record<string, number> = {};
  for (const key of Object.keys(revenusMensuels)) jobsMensuels[key] = 0;
  for (const job of jobs) {
    const key = job.date?.substring(0, 7);
    if (key && key in jobsMensuels) jobsMensuels[key]++;
  }

  // Leads par mois
  const leadsMensuels: Record<string, number> = {};
  for (const key of Object.keys(revenusMensuels)) leadsMensuels[key] = 0;
  for (const client of clients) {
    const key = client.created_at?.substring(0, 7);
    if (key && key in leadsMensuels) leadsMensuels[key]++;
  }

  // Stats rapides
  const leadsActifs = clients.filter(c => c.statut !== "complete" && c.statut !== "sans_suite").length;
  const jobsAFaire = jobs.filter(j => j.statut === "a_faire").length;
  const jobsEnCours = jobs.filter(j => j.statut === "en_cours").length;

  return NextResponse.json({
    totalLeads,
    leadsActifs,
    leadsConvertis,
    tauxConversion,
    pipelineTotal,
    pipelineActif,
    revenuTotal,
    revenuMoyen,
    jobsAFaire,
    jobsEnCours,
    jobsCompletes: jobsCompletesAll.length,
    revenusMensuels,
    jobsMensuels,
    leadsMensuels,
  });
}
