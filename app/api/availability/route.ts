import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const TIME_SLOTS = ["10h00 - 11h00", "12h00 - 13h00", "15h00 - 16h00"];

// Maps slot label to start hour
const SLOT_HOURS: Record<string, number> = {
  "10h00 - 11h00": 10,
  "12h00 - 13h00": 12,
  "15h00 - 16h00": 15,
};

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD
  if (!date) return NextResponse.json({ bookedSlots: [] });

  if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_CALENDAR_ID) {
    return NextResponse.json({ bookedSlots: [] });
  }

  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const timeMin = `${date}T00:00:00-04:00`;
    const timeMax = `${date}T23:59:59-04:00`;

    const res = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
    });

    const events = res.data.items ?? [];

    const bookedSlots = TIME_SLOTS.filter((slot) => {
      const slotHour = SLOT_HOURS[slot];
      return events.some((event) => {
        const start = event.start?.dateTime;
        if (!start) return false;
        // Parse local hour directly from the string (e.g. "2026-04-05T10:00:00-04:00" → 10)
        const hour = parseInt(start.split("T")[1].substring(0, 2), 10);
        return hour === slotHour;
      });
    });

    return NextResponse.json({ bookedSlots });
  } catch (err) {
    console.error("[availability] error:", err);
    return NextResponse.json({ bookedSlots: [] });
  }
}
