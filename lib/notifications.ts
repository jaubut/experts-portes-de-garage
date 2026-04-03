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
  quoteNum?: string;
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

export function buildClientEmailHtml(data: BookingPayload, eventId?: string, withQuote?: boolean): string {
  const prenom = data.nom.trim().split(/\s+/)[0];
  const dateFormatted = formatDateFr(data.date);
  const secret = process.env.ADMIN_PASSWORD ?? "";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://expertsportesdegarage.ca";

  const actionButtons = eventId ? `
    <div style="margin: 28px 0; text-align: center;">
      <p style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">Veuillez confirmer ou annuler votre rendez-vous en cliquant ci-dessous :</p>
      <div style="display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
        <a href="${baseUrl}/api/admin/action?eventId=${eventId}&action=confirme&secret=${encodeURIComponent(secret)}"
           style="display: inline-block; background: #16a34a; color: #fff; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; letter-spacing: 0.3px;">
          ✓ Confirmer mon rendez-vous
        </a>
        <a href="${baseUrl}/api/admin/action?eventId=${eventId}&action=annule&secret=${encodeURIComponent(secret)}"
           style="display: inline-block; background: #f3f4f6; color: #6b7280; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px;">
          ✕ Annuler
        </a>
      </div>
    </div>` : "";

  let priceSection = "";
  if (withQuote && data.serviceType === "Remplacement de coupe-froid") {
    const ws = data as WeatherSealBookingPayload;
    const measurableSeals = ws.seals.filter((id) => id !== "inconnu" && ws.measurements[id]);
    const subtotal = calcTotal(ws.seals, ws.measurements);
    const tps = subtotal * 0.05;
    const tvq = subtotal * 0.09975;
    const total = subtotal + tps + tvq;
    if (subtotal > 0) {
      const rows = measurableSeals.map((id) => {
        const ft = parseFloat(ws.measurements[id] || "0") || 0;
        const lineTotal = ft * (PRICE_PER_FOOT[id] || 0);
        return `<tr>
          <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #f3f4f6;">${SEAL_LABELS[id]}</td>
          <td style="padding: 8px 0; font-size: 14px; color: #6b7280; text-align: center; border-bottom: 1px solid #f3f4f6;">${ft} pi</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #1a1a1a; text-align: right; border-bottom: 1px solid #f3f4f6;">${lineTotal.toFixed(2)} $</td>
        </tr>`;
      }).join("");
      priceSection = `
        <div style="margin: 24px 0;">
          <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px;">💰 Votre estimation</p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 8px 0; font-size: 11px; color: #6b7280; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
                <th style="padding: 8px 0; font-size: 11px; color: #6b7280; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Mesure</th>
                <th style="padding: 8px 0; font-size: 11px; color: #6b7280; text-align: right; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Montant</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <tr><td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Sous-total</td><td style="padding: 4px 0; font-size: 13px; text-align: right; color: #1a1a1a;">${subtotal.toFixed(2)} $</td></tr>
            <tr><td style="padding: 4px 0; font-size: 13px; color: #6b7280;">TPS (5%)</td><td style="padding: 4px 0; font-size: 13px; text-align: right; color: #1a1a1a;">${tps.toFixed(2)} $</td></tr>
            <tr><td style="padding: 4px 0; font-size: 13px; color: #6b7280;">TVQ (9,975%)</td><td style="padding: 4px 0; font-size: 13px; text-align: right; color: #1a1a1a;">${tvq.toFixed(2)} $</td></tr>
            <tr style="border-top: 2px solid #DC2626;">
              <td style="padding: 10px 0 4px; font-size: 15px; font-weight: 700; color: #1a1a1a;">Total (taxes incluses)</td>
              <td style="padding: 10px 0 4px; font-size: 18px; font-weight: 700; color: #DC2626; text-align: right;">${total.toFixed(2)} $</td>
            </tr>
          </table>
        </div>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #1a1a1a;">💳 Payer en avance par virement Interac</p>
          <p style="margin: 0 0 4px; font-size: 14px; color: #1a1a1a;">Envoyez <strong>${total.toFixed(2)} $</strong> à : <strong style="color: #DC2626;">${EMAIL}</strong></p>
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">Votre numéro de soumission se trouve sur le PDF ci-joint.</p>
        </div>`;
    }
  }

  return `
    <div style="${baseStyle} max-width: 600px; margin: 0 auto;">
      <div style="background: #DC2626; padding: 24px 28px; border-radius: 8px 8px 0 0;">
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Experts Portes de Garage</p>
        <h1 style="margin: 6px 0 0; font-size: 22px; color: #fff;">Bonjour ${prenom}, votre demande est reçue!</h1>
      </div>
      <div style="background: #fff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 15px; line-height: 1.7; color: #1a1a1a;">
          Vous vous êtes engagé à recevoir un technicien d'<strong>Experts Portes de Garage</strong> à votre domicile.
          Des centaines de clients nous font confiance chaque année — nous avons hâte de vous offrir le même service de qualité.
        </p>

        <div style="background: #fef2f2; border: 2px solid #DC2626; border-radius: 10px; padding: 20px 24px; margin: 20px 0;">
          <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px;">📅 Votre rendez-vous</p>
          <p style="margin: 6px 0; font-size: 15px;"><strong>Service :</strong> ${data.serviceType}</p>
          <p style="margin: 6px 0; font-size: 15px;"><strong>Date :</strong> ${dateFormatted}</p>
          <p style="margin: 6px 0; font-size: 15px;"><strong>Heure :</strong> ${data.timeSlot}</p>
          <p style="margin: 6px 0; font-size: 15px;"><strong>Adresse :</strong> ${data.adresse}, ${data.ville}</p>
        </div>

        ${priceSection}

        ${actionButtons}

        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
          Des questions? Appelez-nous au <a href="${PHONE_HREF}" style="color: #DC2626; font-weight: 700;">${PHONE_DISPLAY}</a> ou répondez à ce courriel — nous sommes là pour vous.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
          Experts Portes de Garage · ${PHONE_DISPLAY} · ${EMAIL}
        </p>
      </div>
    </div>`;
}

export function buildReviewEmailHtml(nom: string): string {
  const prenom = nom.trim().split(/\s+/)[0];
  return `
    <div style="${baseStyle} max-width: 600px; margin: 0 auto;">
      <div style="background: #DC2626; padding: 24px 28px; border-radius: 8px 8px 0 0;">
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Experts Portes de Garage</p>
        <h1 style="margin: 6px 0 0; font-size: 22px; color: #fff;">Merci ${prenom}! 🙏</h1>
      </div>
      <div style="background: #fff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 15px; line-height: 1.7; color: #1a1a1a;">
          C'était un plaisir de vous aider! Nous espérons que vous êtes satisfait du service rendu par notre équipe.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #1a1a1a;">
          Si vous avez une minute, votre avis Google aide énormément d'autres clients à nous trouver et fait une vraie différence pour notre petite entreprise. 😊
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://g.page/r/CT-AI6_v4mdPEAI/review"
             style="display: inline-block; background: #DC2626; color: #fff; font-weight: 700; padding: 16px 36px; border-radius: 10px; text-decoration: none; font-size: 16px; letter-spacing: 0.3px;">
            ⭐ Laisser un avis Google
          </a>
        </div>
        <p style="font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
          Ça ne prend que 30 secondes et ça nous aide vraiment!
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
          Experts Portes de Garage · ${PHONE_DISPLAY} · ${EMAIL}
        </p>
      </div>
    </div>`;
}

export async function sendReviewEmail(nom: string, courriel: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const prenom = nom.trim().split(/\s+/)[0];
  await resend.emails.send({
    from: `Experts Portes de Garage <${process.env.RESEND_FROM_EMAIL!}>`,
    to: [courriel],
    subject: `Merci ${prenom}! Un petit avis Google? ⭐`,
    html: buildReviewEmailHtml(nom),
  });
}

// ── Resend ────────────────────────────────────────────────────────────────

export async function sendQuoteEmail(data: WeatherSealBookingPayload, pdfBuffer: Buffer): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = `Experts Portes de Garage <${process.env.RESEND_FROM_EMAIL!}>`;
  const prenom = data.nom.trim().split(/\s+/)[0];
  const total = calcTotal(data.seals, data.measurements) * 1.14975;
  await resend.emails.send({
    from,
    to: [data.courriel],
    subject: `Votre soumission — Experts Portes de Garage`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
        <div style="background: #CC0000; padding: 24px 28px; border-radius: 8px 8px 0 0;">
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Experts Portes de Garage</p>
          <h1 style="margin: 6px 0 0; font-size: 22px; color: #fff;">Votre soumission, ${prenom}!</h1>
        </div>
        <div style="background: #fff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 15px; line-height: 1.7; color: #1a1a1a;">
            Vous trouverez votre soumission en pièce jointe (PDF). Elle est valide <strong>30 jours</strong>.
          </p>
          ${total > 0 ? `
          <div style="background: #fef2f2; border: 2px solid #CC0000; border-radius: 10px; padding: 16px 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 6px; font-size: 13px; color: #CC0000; font-weight: 700; text-transform: uppercase;">Total estimé (taxes incluses)</p>
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #CC0000;">${total.toFixed(2)} $</p>
          </div>` : ""}
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">💳 Payer en avance par Interac</p>
            <p style="margin: 0 0 4px; font-size: 14px;">Envoyez le montant à : <strong style="color: #CC0000;">${EMAIL}</strong></p>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">Votre numéro de soumission se trouve sur le PDF.</p>
          </div>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Des questions? Appelez-nous au <a href="tel:${PHONE_DISPLAY.replace(/\s/g, "")}" style="color: #CC0000; font-weight: 700;">${PHONE_DISPLAY}</a> — nous sommes là pour vous.
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
            Experts Portes de Garage · ${PHONE_DISPLAY} · ${EMAIL}
          </p>
        </div>
      </div>`,
    attachments: [{
      filename: `soumission_coupe_froid_${data.date}.pdf`,
      content: pdfBuffer,
    }],
  });
}

export async function sendBookingEmails(data: BookingPayload, eventId?: string, pdfBuffer?: Buffer): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = `Experts Portes de Garage <${process.env.RESEND_FROM_EMAIL!}>`;
  const withQuote = !!pdfBuffer;
  const clientEmail: Parameters<typeof resend.emails.send>[0] = {
    from,
    to: [data.courriel],
    subject: `Bonjour ${data.nom.trim().split(/\s+/)[0]}, votre rendez-vous du ${formatDateFr(data.date)} — Experts Portes de Garage`,
    html: buildClientEmailHtml(data, eventId, withQuote),
  };
  if (pdfBuffer) {
    clientEmail.attachments = [{
      filename: `soumission_coupe_froid_${data.date}.pdf`,
      content: pdfBuffer,
    }];
  }
  await Promise.all([
    resend.emails.send({
      from,
      to: [process.env.OWNER_EMAIL!],
      subject: `Nouvelle réservation — ${data.serviceType} — ${data.nom}`,
      html: buildOwnerEmailHtml(data),
    }),
    resend.emails.send(clientEmail),
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
    if (total > 0) {
      lines.push(`Estimation: ${total.toFixed(2)}$`);
      lines.push(`Estimation TTC: ${(total * 1.14975).toFixed(2)}$ (taxes incluses)`);
    }
    if (ws.quoteNum) lines.push(`Soumission: ${ws.quoteNum}`);
    if (ws.notes) lines.push(`Notes: ${ws.notes}`);
  }

  return lines.join("\n");
}

export async function createCalendarEvent(data: BookingPayload): Promise<string | undefined> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  const { startStr, endStr } = parseTimeSlot(data.date, data.timeSlot);

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary: `${data.serviceType} — ${data.nom}`,
      description: buildEventDescription(data),
      start: { dateTime: startStr, timeZone: "America/Toronto" },
      end: { dateTime: endStr, timeZone: "America/Toronto" },
      location: `${data.adresse}, ${data.ville}, QC ${data.codePostal}`,
    },
  });
  return res.data.id ?? undefined;
}
