import { NextResponse } from "next/server";
import { sendBookingEmails, createCalendarEvent } from "@/lib/notifications";
import type { WeatherSealBookingPayload } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nom, telephone, courriel, adresse, ville, codePostal, date, timeSlot, seals, condition, notes, measurements, color } = body;

    if (!nom || !telephone || !courriel || !adresse || !ville || !codePostal || !date || !timeSlot || !seals || !condition) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const payload: WeatherSealBookingPayload = {
      serviceType: "Remplacement de coupe-froid",
      nom,
      telephone,
      courriel,
      adresse,
      ville,
      codePostal,
      date,
      timeSlot,
      seals,
      condition,
      notes: notes || "",
      measurements: measurements || {},
      color: color || "",
    };

    await sendBookingEmails(payload);
    if (process.env.GOOGLE_PRIVATE_KEY) {
      createCalendarEvent(payload).catch((err) => console.error("[booking-coupe-froid] calendar error:", err));
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[booking-coupe-froid] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
