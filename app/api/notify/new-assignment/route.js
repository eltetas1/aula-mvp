// app/api/notify/new-assignment/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { recipients, assignment } = await req.json();
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ ok: true, skipped: "no recipients" });
    }

    const from = process.env.NOTIFY_FROM_EMAIL || "Aula <onboarding@resend.dev>";
    const site = process.env.SITE_NAME || "Aula";
    const due = assignment?.dueDateStr ? ` (fecha límite: ${assignment.dueDateStr})` : "";
    const subject = `[${site}] Nueva tarea ${assignment?.classGroup ? `(${assignment.classGroup})` : ""}: ${assignment?.title || ""}`;

    const html = `
      <div style="font-family:system-ui,sans-serif">
        <h2>Se ha publicado una nueva tarea</h2>
        <p><b>Clase:</b> ${assignment?.classGroup || "—"}</p>
        <p><b>Título:</b> ${assignment?.title || "—"}</p>
        ${assignment?.description ? `<p><b>Descripción:</b><br>${escapeHtml(assignment.description).replace(/\n/g,"<br>")}</p>` : ""}
        <p><b>Estado:</b> Publicada${due}</p>
        <p>Podéis ver y entregar la tarea en la web del aula.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: recipients, subject, html }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: data?.id || null });
  } catch (e) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

// simple escapado
function escapeHtml(s=""){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
