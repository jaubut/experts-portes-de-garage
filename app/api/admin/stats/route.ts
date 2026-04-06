import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();

  const [clientsRes, jobsRes] = await Promise.all([
    supabase.from("clients").select("id, statut, montant_estime, created_at"),
    supabase.from("jobs").select("id, statut, montant, date, telephone"),
  ]);

  const clients = clientsRes.data ?? [];
  const jobs = jobsRes.data ?? [];

  // Pipeline valeur
  const pipelineTotal = clients.reduce((s, c) => s + (c.montant_estime ?? 0), 0);
  const pipelineActif = clients
    .filter(c => c.statut !== "complete" && c.statut !== "sans_suite")
    .reduce((s, c) => s + (c.montant_estime ?? 0), 0);

  // Taux de conversion
  const totalLeads = clients.length;
  const leadsConvertis = clients.filter(c => c.statut === "complete" || c.statut === "job_planifie").length;
  const tauxConversion = totalLeads > 0 ? Math.round((leadsConvertis / totalLeads) * 100) : 0;

  // Revenu moyen par lead converti
  const jobsCompletes = jobs.filter(j => j.statut === "complete" && j.montant);
  const revenuTotal = jobsCompletes.reduce((s, j) => s + (j.montant ?? 0), 0);
  const revenuMoyen = jobsCompletes.length > 0 ? Math.round(revenuTotal / jobsCompletes.length) : 0;

  // Revenus par mois (12 derniers mois)
  const revenusMensuels: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenusMensuels[key] = 0;
  }
  for (const job of jobsCompletes) {
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
    jobsCompletes: jobsCompletes.length,
    revenusMensuels,
    jobsMensuels,
    leadsMensuels,
  });
}
