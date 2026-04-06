import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { nom, courriel } = await req.json();

  if (!courriel || !nom) {
    return NextResponse.json({ error: "Nom et courriel requis" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@expertsportesdegarage.ca";

  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurée" }, { status: 500 });
  }

  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL ?? "https://g.page/r/expertsportesdegarage/review";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="background: #cc0000; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Experts Portes de Garage</h1>
      </div>
      <div style="padding: 24px; background: #f9f9f9; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1a1a1a;">Bonjour ${nom},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          Merci d'avoir fait confiance à <strong>Experts Portes de Garage</strong>!
          On espère que le service a été à la hauteur de vos attentes.
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          Si vous avez 30 secondes, un petit avis Google nous aiderait énormément.
          C'est la meilleure façon de soutenir une entreprise locale comme la nôtre.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${googleReviewUrl}" style="display: inline-block; background: #cc0000; color: white; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px;">
            Laisser un avis Google
          </a>
        </div>
        <p style="font-size: 13px; color: #999; text-align: center;">
          Merci beaucoup! — L'équipe Experts Portes de Garage
        </p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Experts Portes de Garage <${fromEmail}>`,
        to: [courriel],
        subject: "Votre avis compte — Experts Portes de Garage",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[review-request] resend error:", err);
      return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[review-request] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
