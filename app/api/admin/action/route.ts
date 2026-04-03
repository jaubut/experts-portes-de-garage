import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const eventId = searchParams.get("eventId");
  const action = searchParams.get("action"); // "confirme" or "annule"
  const secret = searchParams.get("secret");

  if (!eventId || !action || secret !== process.env.ADMIN_PASSWORD) {
    return new NextResponse(errorPage("Lien invalide ou expiré."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (action !== "confirme" && action !== "annule") {
    return new NextResponse(errorPage("Action inconnue."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const calendar = google.calendar({ version: "v3", auth: getAuth() });

    if (action === "annule") {
      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        eventId,
      });
      return new NextResponse(successPage("annule"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId,
      requestBody: {
        extendedProperties: { private: { status: "confirme" } },
      },
    });

    return new NextResponse(successPage("confirme"), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("[admin/action] error:", err);
    return new NextResponse(errorPage("Une erreur est survenue. Veuillez nous appeler."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

function successPage(action: string): string {
  const isConfirm = action === "confirme";
  const title = isConfirm ? "Rendez-vous confirmé ✓" : "Rendez-vous annulé";
  const msg = isConfirm
    ? "Merci! Votre rendez-vous est bien confirmé. Nous avons hâte de vous aider."
    : "Votre rendez-vous a été annulé. N'hésitez pas à nous recontacter pour en planifier un autre.";
  const color = isConfirm ? "#16a34a" : "#DC2626";

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
  <style>body{margin:0;font-family:Arial,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;}
  .card{background:#fff;border-radius:12px;padding:40px;max-width:440px;width:90%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .icon{font-size:48px;margin-bottom:16px;}h1{font-size:22px;color:#1a1a1a;margin:0 0 12px;}
  p{color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;}
  a{display:inline-block;background:${color};color:#fff;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;}</style>
  </head><body><div class="card">
  <div class="icon">${isConfirm ? "✅" : "❌"}</div>
  <h1>${title}</h1><p>${msg}</p>
  <a href="https://expertsportesdegarage.ca">Retour au site</a>
  </div></body></html>`;
}

function errorPage(msg: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Erreur</title>
  <style>body{margin:0;font-family:Arial,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;}
  .card{background:#fff;border-radius:12px;padding:40px;max-width:440px;width:90%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  h1{font-size:20px;color:#DC2626;}p{color:#4b5563;font-size:15px;}
  a{color:#DC2626;font-weight:700;}</style>
  </head><body><div class="card"><h1>⚠️ Erreur</h1><p>${msg}</p>
  <p>Appelez-nous au <a href="tel:4505585788">450-558-5788</a></p>
  </div></body></html>`;
}
