import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { sendReviewEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { eventId, status, nom, courriel } = await req.json();

  if (!eventId || !status) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    eventId,
    requestBody: {
      extendedProperties: {
        private: { status },
      },
    },
  });

  // Send review email when job is marked as completed
  if (status === "termine" && nom && courriel) {
    sendReviewEmail(nom, courriel).catch((err) => console.error("[status] review email error:", err));
  }

  return NextResponse.json({ success: true });
}
