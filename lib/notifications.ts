import { Resend } from "resend";
import { google } from "googleapis";
import { PHONE_DISPLAY, PHONE_HREF, EMAIL } from "@/lib/config";

// ── Types ──────────────────────────────────────────────────────────────────

export interface BaseBookingPayload {
  nom: string;
  telephone: string;
  courriel: string;
  adresse: string;
  ville: string;
  codePostal: string;
  date: string;      // YYYY-MM-DD
  timeSlot: string;  // "10h00 - 11h00"
}

export interface GeneralBookingPayload extends BaseBookingPayload {
  serviceType: "Réparation / Remplacement de porte";
}

export interface WeatherSealBookingPayload extends BaseBookingPayload {
  serviceType: "Remplacement de coupe-froid";
  seals: string[];
  condition: string;
  notes: string;
  measurements: Record<string, string>;
  color: string;
}

export type BookingPayload = GeneralBookingPayload | WeatherSealBookingPayload;

// ── Constants ─────────────────────────────────────────────────────────────

const SEAL_LABELS: Record<string, string> = {
  bas: "Joint de bas de porte",
  lateraux: "Joints latéraux et de tête",
  reteneur: "Reteneur du bas",
  inconnu: "Inspection complète",
};

const CONDITION_LABELS: Record<string, string> = {
  craquele: "Craquelé ou durci",
  decolle: "Décollé ou arraché",
  infiltration: "Infiltrations d'air ou d'eau",
  insectes: "Insectes ou nuisibles",
  autre: "Autre / Je ne sais pas",
};

const PRICE_PER_FOOT: Record<string, number> = {
  bas: 5,
  lateraux: 7,
  reteneur: 10,
};

const FR_DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const FR_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDateFr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${FR_DAYS[dow]} ${d} ${FR_MONTHS[m - 1]} ${y}`;
}

function parseTimeSlot(date: string, timeSlot: string): { startStr: string; endStr: string } {
  const [startPart] = timeSlot.split(" - ");
  const [hourStr, minuteStr] = startPart.split("h");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr || "0", 10);
  const [year, month, day] = date.split("-");
  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}-${month}-${day}T${pad(hour)}:${pad(minute)}:00`;
  const endStr = `${year}-${month}-${day}T${pad(hour + 1)}:${pad(minute)}:00`;
  return { startStr, endStr };
}

function calcTotal(seals: string[], measurements: Record<string, string>): number {
  return seals
    .filter((id) => id !== "inconnu")
    .reduce((sum, id) => {
      const ft = parseFloat(measurements[id] || "0") || 0;
      return sum + ft * (PRICE_PER_FOOT[id] || 0);
    }, 0);
}

// ── Email HTML builders ───────────────────────────────────────────────────

const baseStyle = `font-family: Arial, sans-serif; color: #1a1a1a;`;

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 6px 12px 6px 0; font-size: 13px; color: #666; white-space: nowrap; vertical-align: top;">${label}</td>
      <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1a1a1a;">${value}</td>
    </tr>`;
}

function section(title: string, rows: string): string {
  return `
    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #DC2626;">${title}</p>
      <table style="border-collapse: collapse; width: 100%;">${rows}</table>
    </div>`;
}

export function buildOwnerEmailHtml(data: BookingPayload): string {
  const isWeatherSeal = data.serviceType === "Remplacement de coupe-froid";
  const ws = isWeatherSeal ? (data as WeatherSealBookingPayload) : null;
  const total = ws ? calcTotal(ws.seals, ws.measurements) : 0;

  const appointmentRows =
    row("Service :", data.serviceType) +
    row("Date :", formatDateFr(data.date)) +
    row("Heure :", data.timeSlot);

  const clientRows =
    row("Nom :", data.nom) +
    row("Téléphone :", `<a href="tel:${data.telephone}" style="color: #DC2626;">${data.telephone}</a>`) +
    row("Courriel :", `<a href="mailto:${data.courriel}" style="color: #DC2626;">${data.courriel}</a>`);

  const addressRows =
    row("Adresse :", data.adresse) +
    row("Ville :", `${data.ville}, QC`) +
    row("Code postal :", data.codePostal);

  let sealSection = "";
  if (ws) {
    const sealNames = ws.seals.map((s) => SEAL_LABELS[s] || s).join(", ");
    const conditionLabel = CONDITION_LABELS[ws.condition] || ws.condition;
    let sealRows = row("Joints :", sealNames) + row("Condition :", conditionLabel);
    if (ws.color) sealRows += row("Couleur :", ws.color.charAt(0).toUpperCase() + ws.color.slice(1));
    const measurableSeals = ws.seals.filter((s) => s !== "inconnu");
    if (measurableSeals.length > 0) {
      const mesuresText = measurableSeals
        .filter((s) => ws.measurements[s])
        .map((s) => `${SEAL_LABELS[s]}: ${ws.measurements[s]} pi`)
        .join("<br>");
      if (mesuresText) sealRows += row("Mesures :", mesuresText);
    }
    if (total > 0) sealRows += row("Estimation :", `<strong style="color: #DC2626; font-size: 15px;">${total.toFixed(2)}$</strong>`);
    if (ws.notes) sealRows += row("Notes :", ws.notes);
    sealSection = section("Détails du service", sealRows);
  }

  return `
    <div style="${baseStyle} max-width: 600px; margin: 0 auto;">
      <div style="background: #DC2626; padding: 24px 28px; border-radius: 8px 8px 0 0;">
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Experts Portes de Garage</p>
        <h1 style="margin: 6px 0 0; font-size: 22px; color: #fff;">Nouvelle réservation</h1>
      </div>
      <div style="background: #fff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        ${section("Rendez-vous", appointmentRows)}
        ${section("Client", clientRows)}
        ${section("Adresse de service", addressRows)}
        ${sealSection}
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
          Experts Portes de Garage · ${PHONE_DISPLAY} · ${EMAIL}
        </p>
      </div>
    </div>`;
}

export function buildClientEmailHtml(data: BookingPayload): string {
  const prenom = data.nom.trim().split(/\s+/)[0];
  return `
    <div style="${baseStyle} max-width: 600px; margin: 0 auto;">
      <div style="background: #DC2626; padding: 24px 28px; border-radius: 8px 8px 0 0;">
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Experts Portes de Garage</p>
        <h1 style="margin: 6px 0 0; font-size: 22px; color: #fff;">Demande reçue, ${prenom}!</h1>
      </div>
      <div style="background: #fff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 15px; line-height: 1.6;">Merci d'avoir contacté Experts Portes de Garage. Nous avons bien reçu votre demande et vous contacterons rapidement pour confirmer votre rendez-vous.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px;">Votre rendez-vous demandé</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Date :</strong> ${formatDateFr(data.date)}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Heure :</strong> ${data.timeSlot}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Adresse :</strong> ${data.adresse}, ${data.ville}</p>
        </div>
        <p style="font-size: 14px; color: #4b5563;">Des questions? Appelez-nous au <a href="${PHONE_HREF}" style="color: #DC2626; font-weight: 700;">${PHONE_DISPLAY}</a> ou répondez à ce courriel.</p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
          Experts Portes de Garage · ${PHONE_DISPLAY} · ${EMAIL}
        </p>
      </div>
    </div>`;
}

// ── Resend ────────────────────────────────────────────────────────────────

export async function sendBookingEmails(data: BookingPayload): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = `Experts Portes de Garage <${process.env.RESEND_FROM_EMAIL!}>`;
  await Promise.all([
    resend.emails.send({
      from,
      to: [process.env.OWNER_EMAIL!],
      subject: `Nouvelle réservation — ${data.serviceType} — ${data.nom}`,
      html: buildOwnerEmailHtml(data),
    }),
    resend.emails.send({
      from,
      to: [data.courriel],
      subject: "Votre demande de service a bien été reçue — Experts Portes de Garage",
      html: buildClientEmailHtml(data),
    }),
  ]);
}

// ── Google Calendar ───────────────────────────────────────────────────────

function buildEventDescription(data: BookingPayload): string {
  const lines = [
    `Service: ${data.serviceType}`,
    `Client: ${data.nom}`,
    `Téléphone: ${data.telephone}`,
    `Courriel: ${data.courriel}`,
    `Adresse: ${data.adresse}, ${data.ville}, QC ${data.codePostal}`,
  ];

  if (data.serviceType === "Remplacement de coupe-froid") {
    const ws = data as WeatherSealBookingPayload;
    lines.push("");
    lines.push(`Joints: ${ws.seals.map((s) => SEAL_LABELS[s] || s).join(", ")}`);
    if (ws.color) lines.push(`Couleur: ${ws.color}`);
    const measurableSeals = ws.seals.filter((s) => s !== "inconnu" && ws.measurements[s]);
    if (measurableSeals.length > 0) {
      lines.push("Mesures:");
      measurableSeals.forEach((s) => lines.push(`  ${SEAL_LABELS[s]}: ${ws.measurements[s]} pi`));
    }
    const total = calcTotal(ws.seals, ws.measurements);
    if (total > 0) lines.push(`Estimation: ${total.toFixed(2)}$`);
    if (ws.notes) lines.push(`Notes: ${ws.notes}`);
  }

  return lines.join("\n");
}

export async function createCalendarEvent(data: BookingPayload): Promise<void> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  const { startStr, endStr } = parseTimeSlot(data.date, data.timeSlot);

  await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary: `${data.serviceType} — ${data.nom}`,
      description: buildEventDescription(data),
      start: { dateTime: startStr, timeZone: "America/Toronto" },
      end: { dateTime: endStr, timeZone: "America/Toronto" },
      location: `${data.adresse}, ${data.ville}, QC ${data.codePostal}`,
    },
  });
}
