import { NextResponse } from "next/server";
import { sendBookingEmails, createCalendarEvent } from "@/lib/notifications";
import type { GeneralBookingPayload } from "@/lib/notifications";
import { saveBookingToDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nom, telephone, courriel, adresse, ville, codePostal, date, timeSlot } = body;

    if (!nom || !telephone || !courriel || !adresse || !ville || !codePostal || !date || !timeSlot) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const payload: GeneralBookingPayload = {
      serviceType: "Réparation / Remplacement de porte",
      nom,
      telephone,
      courriel,
      adresse,
      ville,
      codePostal,
      date,
      timeSlot,
    };

    let eventId: string | undefined;
    if (process.env.GOOGLE_PRIVATE_KEY) {
      try { eventId = await createCalendarEvent(payload); } catch (err) { console.error("[booking] calendar error:", err); }
    }
    if (process.env.SUPABASE_URL) {
      try { await saveBookingToDb(payload, eventId); } catch (err) { console.error("[booking] supabase error:", err); }
    }
    await sendBookingEmails(payload, eventId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[booking] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
