// app/api/notify/submission-updated/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { recipients, submission } = await req.json();
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ ok: true, skipped: "no recipients" });
    }

    const from = process.env.NOTIFY_FROM_EMAIL || "Aula <onboarding@resend.dev>";
    const site = process.env.SITE_NAME || "Aula";

    const statusLabel = {
      approved: "Aprobado ✅",
      needs_changes: "Necesita cambios ✏️",
      rejected: "Rechazado ❌",
      sent: "Pendiente",
    }[submission?.status || "sent"] || "Pendiente";

    const subject = `[${site}] ${submission?.studentName || "Alumno"} — ${submission?.assignmentTitle || "Tarea"} (${statusLabel})`;

    const rows = [
      ["Alumno", submission?.studentName || "—"],
      ["Clase", submission?.classGroup || "—"],
      ["Tarea", submission?.assignmentTitle || "—"],
      ["Estado", statusLabel],
      ["Nota", submission?.grade ?? "—"],
    ];

    const feedbackHtml = submission?.feedback
      ? `<p><b>Comentario del profesor:</b><br>${escapeHtml(submission.feedback).replace(/\n/g,"<br>")}</p>`
      : "";

    const html = `
      <div style="font-family:system-ui,sans-serif">
        <h2>Actualización de la tarea</h2>
        <table cellspacing="0" cellpadding="6" style="border-collapse:collapse">
          ${rows.map(([k,v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(String(v))}</td></tr>`).join("")}
        </table>
        ${feedbackHtml}
        <p>Pueden consultar la tarea y la entrega en la web del aula.</p>
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

function escapeHtml(s=""){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
