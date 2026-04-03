import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ emails: [] });
  }

  try {
    const res = await fetch("https://api.resend.com/emails?limit=50", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    const data = await res.json();
    return NextResponse.json({ emails: data.data ?? [] });
  } catch (err) {
    console.error("[admin/emails] error:", err);
    return NextResponse.json({ emails: [] });
  }
}
