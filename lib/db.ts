import { supabase } from "./supabase";
import type { GeneralBookingPayload, WeatherSealBookingPayload } from "./notifications";

const PRICE_PER_FOOT: Record<string, number> = {
  bas: 5,
  lateraux: 7,
  reteneur: 10,
};

function calcSubtotal(seals: string[], measurements: Record<string, string>): number {
  return seals
    .filter((id) => id !== "inconnu")
    .reduce((sum, id) => {
      const ft = parseFloat(measurements[id] || "0") || 0;
      return sum + ft * (PRICE_PER_FOOT[id] || 0);
    }, 0);
}

async function upsertClient(data: {
  nom: string;
  telephone: string;
  courriel: string;
  adresse: string;
  ville: string;
  codePostal: string;
}): Promise<string> {
  const { data: client, error } = await supabase
    .from("clients")
    .upsert(
      {
        nom: data.nom,
        telephone: data.telephone,
        courriel: data.courriel,
        adresse: data.adresse,
        ville: data.ville,
        code_postal: data.codePostal,
      },
      { onConflict: "courriel" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return client.id;
}

export async function saveBookingToDb(
  data: GeneralBookingPayload,
  eventId?: string
): Promise<void> {
  const clientId = await upsertClient(data);

  const { error } = await supabase.from("rendez_vous").insert({
    client_id: clientId,
    service: data.serviceType,
    date: data.date,
    heure: data.timeSlot,
    statut: "en_attente",
    google_event_id: eventId ?? null,
  });

  if (error) throw error;
}

export async function saveWeatherSealBookingToDb(
  data: WeatherSealBookingPayload,
  eventId?: string
): Promise<void> {
  const clientId = await upsertClient(data);

  const { data: rdv, error: rdvError } = await supabase
    .from("rendez_vous")
    .insert({
      client_id: clientId,
      service: data.serviceType,
      date: data.date,
      heure: data.timeSlot,
      statut: "en_attente",
      google_event_id: eventId ?? null,
      numero_soumission: data.quoteNum ?? null,
    })
    .select("id")
    .single();

  if (rdvError) throw rdvError;

  const measurableSeals = data.seals.filter(
    (id) => id !== "inconnu" && data.measurements[id]
  );

  if (measurableSeals.length > 0 && data.quoteNum) {
    const sous_total = calcSubtotal(data.seals, data.measurements);
    const tps = sous_total * 0.05;
    const tvq = sous_total * 0.09975;
    const total = sous_total + tps + tvq;

    const items = measurableSeals.map((id) => ({
      id,
      mesure: parseFloat(data.measurements[id] || "0") || 0,
      prix_pied: PRICE_PER_FOOT[id] || 0,
      total: (parseFloat(data.measurements[id] || "0") || 0) * (PRICE_PER_FOOT[id] || 0),
    }));

    const { error: soumError } = await supabase.from("soumissions").insert({
      rendez_vous_id: rdv.id,
      items,
      sous_total,
      tps,
      tvq,
      total,
      numero: data.quoteNum,
    });

    if (soumError) throw soumError;
  }
}
